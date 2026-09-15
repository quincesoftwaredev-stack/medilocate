const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function evaluate(file, globals, names) {
  let source = fs.readFileSync(path.join(root, file), "utf8")
    .replace(/^import .*;\s*$/gm, "")
    .replace(/^import \{[\s\S]*?\} from .*;\s*$/gm, "")
    .replace(/export default handler;/g, "")
    .replace(/^export \{.*\};?$/gm, "")
    .replace(/export (const|async function|function) /g, "$1 ");
  source += "\nthis.result = {" + names.join(",") + "};";
  const context = vm.createContext({ Date, Intl, Number, String, Set, Map, console, process, ...globals });
  vm.runInContext(source, context, { filename: file });
  return context.result;
}

const helpers = evaluate("utility/booking.js", {}, [
  "getDhakaDateKey", "getConsultationTime", "getConsultationEndTime", "normalizeBangladeshPhone",
  "normalizeWeeklyAvailability", "makeSlotKey", "getDhakaDayOfWeek",
  "generateSubSlots", "getWindowPlan", "getDoctorModeConfig", "isUnavailableDate", "minutesToTime",
]);

const config = { reminderBeforeMinutes: { online: 5, chamber: 30, home: 60 }, joinBeforeMinutes: { online: 10 }, managerPhone: "01977629936" };
const state = { appointment: null };
const Booking = {
  findOneAndUpdate(query, update) {
    const role = Object.keys(update.$set)[0].split(".")[1];
    const record = state.appointment;
    const active = ["pending", "confirmed", "rescheduled", "waiting"].includes(record.status);
    const sent = record.smsReminderSent[role];
    if (!active || record.paymentStatus !== "paid" || sent) {
      return { populate() { return this; }, then(resolve) { return Promise.resolve(resolve(null)); } };
    }
    record.smsReminderSending[role] = update.$set[Object.keys(update.$set)[0]];
    return { populate() { return this; }, then(resolve) { return Promise.resolve(resolve(record)); } };
  },
  async updateOne(query, update) {
    const role = Object.keys(query).find((key) => key.startsWith("smsReminderSending."))?.split(".")[1];
    if (update.$set) {
      for (const [key, value] of Object.entries(update.$set)) {
        if (key.startsWith("smsReminderSent.")) state.appointment.smsReminderSent[key.split(".")[1]] = value;
      }
    }
    if (update.$unset && role) state.appointment.smsReminderSending[role] = null;
  },
};
const { getConsultationReminderMinutes, shouldSendConsultationReminder, buildConsultationReminder, sendConsultationReminders } =
  evaluate("services/consultation-reminder.js", {
    Booking, Message: class {}, consultationConfig: config,
    getConsultationTime: helpers.getConsultationTime, normalizeBangladeshPhone: helpers.normalizeBangladeshPhone,
  }, ["getConsultationReminderMinutes", "shouldSendConsultationReminder", "buildConsultationReminder", "sendConsultationReminders"]);

function appointment(type, minutesUntil = 4) {
  const start = new Date(Date.now() + minutesUntil * 60000);
  return {
    _id: "64f0c0a00000000000000001", consultationType: type, appointmentDate: start,
    startTime: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false }).format(start),
    scheduledAt: start, status: "confirmed", paymentStatus: "paid",
    patientName: "Patient", patientPhone: "01977629936",
    doctor: { fullName: "Doctor", phone: "01977629936" },
    patient: { fullName: "Patient", phone: "01977629936" },
    smsReminderSent: { patient: false, doctor: false, manager: false },
    smsReminderSending: { patient: null, doctor: null, manager: null },
  };
}

(async () => {
  assert.equal(helpers.getDoctorModeConfig({ consultationModes: { home: { enabled: false, fee: 0 }, homeVisit: { enabled: true, fee: 140 } } }, "home").fee, 140);
  assert.equal(getConsultationReminderMinutes("online"), 5);
  assert.equal(getConsultationReminderMinutes("chamber"), 30);
  assert.equal(getConsultationReminderMinutes("home"), 60);
  for (const [type, minutes] of [["online", 4], ["chamber", 29], ["home", 59]]) {
    const item = appointment(type, minutes);
    assert.equal(shouldSendConsultationReminder(item), true);
    assert.ok(buildConsultationReminder(item, "patient").includes(type === "home" ? "home consultation" : type));
    item.status = "cancelled";
    assert.equal(shouldSendConsultationReminder(item), false);
  }
  const online = appointment("online");
  state.appointment = online;
  const attempts = [];
  const sender = { async sendMessage({ number, message }) {
    assert.equal(number, "8801977629936");
    attempts.push(message);
    return attempts.length === 3 ? { success: false } : { response_code: 202 };
  } };
  const first = await sendConsultationReminders(online, { sender });
  assert.equal(first.sent.length, 2);
  assert.equal(first.failed.length, 1);
  assert.equal(online.smsReminderSent.patient, true);
  assert.equal(online.smsReminderSent.doctor, true);
  assert.equal(online.smsReminderSent.manager, false);
  await sendConsultationReminders(online, { sender: { async sendMessage() { attempts.push("retry"); return { response_code: 202 }; } } });
  assert.equal(attempts.length, 4);
  assert.equal(online.smsReminderSent.manager, true);
  await sendConsultationReminders(online, { sender });
  assert.equal(attempts.length, 4);

  const slot = { doctorProfileId: "a", dateKey: "2026-09-15", mode: "online", slotId: "one", startTime: "10:00" };
  assert.equal(helpers.makeSlotKey(slot), helpers.makeSlotKey({ ...slot, mode: "home", slotId: "two" }));
  assert.throws(() => helpers.normalizeWeeklyAvailability([{ dayOfWeek: 1, slots: [
    { startTime: "09:00", endTime: "10:00", consultationMode: "online" },
    { startTime: "09:30", endTime: "10:30", consultationMode: "home" },
  ] }]), /overlapping/);

  let createRoute, listRoute, lastFilter;
  const bookingHandler = () => ({ get(_auth, fn) { listRoute = fn; return this; }, post(_auth, fn) { createRoute = fn; return this; } });
  let selectedMode = "online", duplicateRecords = [], overlapping = false, validSlot = true;
  const date = helpers.getDhakaDateKey(new Date(Date.now() + 2 * 86400000));
  const window = { _id: "64f0c0a00000000000000005", startTime: "09:00", endTime: "12:00", consultationMode: "online", slotDurationMinutes: 30, maxPatientsPerWindow: 6, calculationMethod: "duration", chamberId: "64f0c0a00000000000000006" };
  const slots = [window]; slots.id = () => validSlot ? window : null;
  const chambers = [{ _id: window.chamberId, name: "Main chamber", address: "Chamber address", isActive: true }]; chambers.id = () => chambers[0];
  const doctorDoc = {
    _id: "64f0c0a00000000000000007", user: "64f0c0a00000000000000003", status: "active",
    weeklyAvailability: [{ dayOfWeek: helpers.getDhakaDayOfWeek(new Date(date + "T00:00:00+06:00")), isAvailable: true, slots }],
    consultationModes: { chamber: { enabled: true, fee: 100 }, online: { enabled: true, fee: 100 }, homeVisit: { enabled: true, fee: 100 } },
    bookingSettings: { advanceBookingDays: 30, minimumNoticeMinutes: 0, maxPatientsPerDay: 30 },
    departments: [], chambers, consultationFee: 100,
  };
  class ObjectId { constructor() { this.value = "64f0c0a00000000000000009"; } toString() { return this.value; } static isValid(value) { return !!value; } }
  const BookingApi = {
    async updateMany() {},
    async countDocuments() { return 0; },
    find(filter) { lastFilter = filter; return { select() { return this; }, populate() { return this; }, sort() { return this; }, skip() { return this; }, limit() { return this; }, async lean() { return duplicateRecords; }, then(resolve) { return Promise.resolve(resolve([])); } }; },
    async exists() { return overlapping; },
    async create(data) { return { ...data, _id: String(data._id) }; },
  };
  evaluate("pages/api/booking/index.js", {
    nextConnect: bookingHandler, mongoose: { Types: { ObjectId } }, randomBytes: () => Buffer.alloc(12),
    isAuth: () => {}, db: { connect: async () => {} }, Booking: BookingApi, BookingPayment: { find() { return { async lean() { return []; } }; } },
    Doctor: { async findById() { window.consultationMode = selectedMode; return doctorDoc; } },
    User: { findById() { return { select() { return Promise.resolve({ _id: "64f0c0a00000000000000002", fullName: "Patient", phone: "01977629936", role: "patient" }); } }; } },
    ACTIVE_BOOKING_STATUSES: ["awaiting-payment", "pending", "confirmed", "waiting", "ongoing"],
    generateSubSlots: helpers.generateSubSlots, getDhakaDateKey: helpers.getDhakaDateKey,
    getDhakaDayOfWeek: helpers.getDhakaDayOfWeek, getWindowPlan: helpers.getWindowPlan,
    getDoctorModeConfig: helpers.getDoctorModeConfig,
    isUnavailableDate: helpers.isUnavailableDate, makeSlotKey: helpers.makeSlotKey,
    minutesToTime: helpers.minutesToTime, normalizeBangladeshPhone: helpers.normalizeBangladeshPhone,
  }, ["handler"]);
  const book = async (mode) => {
    selectedMode = mode;
    const response = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.body = data; return this; } };
    await createRoute({ user: { _id: "64f0c0a00000000000000002", role: "patient" }, body: {
      doctorProfileId: doctorDoc._id, date, consultationType: mode,
      availabilitySlotId: window._id, startTime: "09:00", patientName: "Patient",
      homeVisitAddress: mode === "home" ? { address: "Private address" } : undefined,
    } }, response);
    return response;
  };
  for (const mode of ["online", "chamber", "home"]) {
    const response = await book(mode);
    assert.equal(response.code, 201, mode + ": " + response.body?.error);
    assert.equal(response.body.consultationType, mode);
    assert.ok(response.body.scheduledAt instanceof Date);
    if (mode === "online") assert.ok(response.body.roomName.startsWith("consultation_"));
    if (mode === "home") assert.equal(response.body.homeVisitAddress.address, "Private address");
    if (mode === "chamber") assert.equal(String(response.body.chamberId), String(window.chamberId));
  }
  validSlot = false;
  assert.equal((await book("online")).code, 400);
  validSlot = true;
  duplicateRecords = [{ startTime: "09:00", serial: null }];
  assert.equal((await book("online")).code, 409);
  duplicateRecords = [];
  overlapping = true;
  assert.equal((await book("home")).code, 409);
  overlapping = false;
  for (const [role, expected] of [["patient", "patient"], ["doctor", "doctor"], ["admin", null]]) {
    const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await listRoute({ user: { _id: "64f0c0a00000000000000002", role }, query: {} }, response);
    assert.equal(response.code, 200);
    if (expected) assert.equal(String(lastFilter[expected]), "64f0c0a00000000000000002");
    else assert.equal(Object.keys(lastFilter).length, 0);
  }

  let doctorRoute, doctorFilter;
  const doctorHandler = () => ({ use() { return this; }, get(fn) { doctorRoute = fn; return this; } });
  evaluate("pages/api/doctor/dashboard.js", {
    nextConnect: doctorHandler, mongoose: { Types: { ObjectId: class { constructor(value) { this.value = value; } toString() { return this.value; } } } },
    isAuth: () => {}, db: { connect: async () => {} },
    Doctor: { findOne() { return { populate() { return this; }, async lean() { return { _id: doctorDoc._id, user: { fullName: "Doctor" }, chambers: [] }; } }; } },
    Booking: {
      find(filter) { doctorFilter = filter; return { populate() { return this; }, sort() { return this; }, async lean() { return []; } }; },
      async countDocuments() { return 0; }, async aggregate() { return []; }, async distinct() { return []; },
    },
    User: { find() { return { select() { return this; }, async lean() { return []; } }; } },
    getDhakaDateKey: helpers.getDhakaDateKey,
  }, ["handler"]);
  for (const [role, code] of [["patient", 403], ["doctor", 200]]) {
    const response = { code: 200, status(value) { this.code = value; return this; }, json(body) { this.body = body; return this; } };
    await doctorRoute({ user: { role, _id: "64f0c0a00000000000000003" } }, response);
    assert.equal(response.code, code);
    if (role === "doctor") assert.equal(String(doctorFilter.doctor), "64f0c0a00000000000000003");
  }

  let detailsRoute;
  const detailHandler = () => ({ use() { return this; }, get(fn) { detailsRoute = fn; return this; }, patch() { return this; } });
  const detailRecord = { _id: "64f0c0a00000000000000001", patient: "64f0c0a00000000000000002", doctor: "64f0c0a00000000000000003", toObject() { return this; } };
  evaluate("pages/api/booking/[id].js", {
    nextConnect: detailHandler, mongoose: { Types: { ObjectId: { isValid: () => true } } },
    isAuth: () => {}, db: { connect: async () => {} },
    Booking: { findById() { return { populate() { return this; }, then(resolve) { return Promise.resolve(resolve(detailRecord)); } }; } },
    consultationConfig: config, getConsultationTime: helpers.getConsultationTime,
  }, ["handler"]);
  for (const [role, id, code] of [
    ["patient", detailRecord.patient, 200], ["doctor", detailRecord.doctor, 200],
    ["patient", "64f0c0a00000000000000004", 403], ["doctor", "64f0c0a00000000000000004", 403],
    ["admin", "64f0c0a00000000000000004", 200],
  ]) {
    const response = { code: 200, status(value) { this.code = value; return this; }, json(body) { this.body = body; return this; } };
    await detailsRoute({ query: { id: detailRecord._id }, user: { _id: id, role } }, response);
    assert.equal(response.code, code);
  }

  detailRecord.patient = { _id: "64f0c0a00000000000000002" };
  detailRecord.doctor = { _id: "64f0c0a00000000000000003" };
  for (const [role, id] of [["patient", detailRecord.patient._id], ["doctor", detailRecord.doctor._id]]) {
    const response = { code: 200, status(value) { this.code = value; return this; }, json(body) { this.body = body; return this; } };
    await detailsRoute({ query: { id: detailRecord._id }, user: { _id: id, role } }, response);
    assert.equal(response.code, 200);
  }

  let route;
  const nextConnect = () => ({ use() { return this; }, get(fn) { route = fn; return this; } });
  const base = appointment("online", 2); base.roomName = "private_room"; base.patient = "64f0c0a00000000000000002"; base.doctor = "64f0c0a00000000000000003";
  base.slotEnd = new Date(Date.now() + 40 * 60000);
  let stored = base;
  const FakeBooking = { async findById() { return stored; } };
  class AccessToken {
    constructor(key, secret, options) { this.options = options; }
    addGrant(grant) { this.grant = grant; }
    async toJwt() { return "signed-test-token"; }
  }
  evaluate("pages/api/consultations/[id]/token.js", {
    nextConnect, mongoose: { Types: { ObjectId: { isValid: () => true } } },
    randomBytes: () => Buffer.alloc(12), AccessToken, isAuth: () => {},
    db: { connect: async () => {} }, Booking: FakeBooking, consultationConfig: config,
    getConsultationTime: helpers.getConsultationTime, getConsultationEndTime: helpers.getConsultationEndTime,
    process: { env: { LIVEKIT_URL: "wss://example.test", LIVEKIT_API_KEY: "key", LIVEKIT_API_SECRET: "secret" } },
  }, ["handler"]);
  const invoke = async (role, id) => {
    const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, setHeader() {} };
    await route({ query: { id: base._id }, user: { role, _id: id } }, response);
    return response;
  };
  assert.equal((await invoke("patient", base.patient)).code, 200);
  assert.equal((await invoke("doctor", base.doctor)).code, 200);
  assert.equal((await invoke("patient", "64f0c0a00000000000000004")).code, 403);
  stored = { ...base, consultationType: "chamber" };
  assert.equal((await invoke("patient", base.patient)).code, 409);
  stored = { ...base, scheduledAt: new Date(Date.now() + 30 * 60000) };
  assert.equal((await invoke("patient", base.patient)).code, 409);
  stored = { ...base, status: "cancelled" };
  assert.equal((await invoke("patient", base.patient)).code, 409);
  stored = { ...base, status: "completed" };
  assert.equal((await invoke("patient", base.patient)).code, 409);
  console.log("Consultation booking, authorization, reminder, slot, and token checks passed.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
