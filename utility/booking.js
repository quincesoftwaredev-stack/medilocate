const ACTIVE_BOOKING_STATUSES = [
  "awaiting-payment",
  "payment-verification-pending",
  "pending",
  "confirmed",
  "reschedule-requested",
  "rescheduled",
];

const pad = (value) => String(value).padStart(2, "0");

export const timeToMinutes = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export const minutesToTime = (value) => `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;

export const getWindowPlan = (slot = {}) => {
  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  if (start === null || end === null || end <= start) return { valid: false, error: "End time must be after start time." };

  const totalMinutes = end - start;
  const bufferMinutes = Math.max(0, Number(slot.bufferMinutes || 0));
  const calculationMethod = slot.calculationMethod === "capacity" ? "capacity" : "duration";

  if (calculationMethod === "capacity") {
    const capacity = Math.max(1, Math.floor(Number(slot.maxPatientsPerWindow || 1)));
    const usableMinutes = totalMinutes - bufferMinutes * Math.max(0, capacity - 1);
    const durationMinutes = Math.floor(usableMinutes / capacity);
    if (durationMinutes < 5) return { valid: false, error: "The selected capacity leaves less than 5 minutes per patient." };
    return { valid: true, start, end, totalMinutes, capacity, durationMinutes, bufferMinutes, calculationMethod };
  }

  const durationMinutes = Math.max(5, Math.floor(Number(slot.slotDurationMinutes || 30)));
  const step = durationMinutes + bufferMinutes;
  const capacity = Math.max(0, Math.floor((totalMinutes + bufferMinutes) / step));
  if (!capacity) return { valid: false, error: "The time range is shorter than one appointment." };
  return { valid: true, start, end, totalMinutes, capacity, durationMinutes, bufferMinutes, calculationMethod };
};

export const generateSubSlots = (slot = {}) => {
  const plan = getWindowPlan(slot);
  if (!plan.valid) return [];
  const results = [];
  let cursor = plan.start;
  for (let index = 0; index < plan.capacity; index += 1) {
    const appointmentEnd = cursor + plan.durationMinutes;
    if (appointmentEnd > plan.end) break;
    results.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(appointmentEnd) });
    cursor = appointmentEnd + plan.bufferMinutes;
  }
  return results;
};

export const getDhakaDateKey = (value) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date(value));

export const getDhakaDayOfWeek = (value) => {
  const label = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", weekday: "short" }).format(new Date(value));
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(label);
};

export const isUnavailableDate = (doctor, value) => {
  const target = getDhakaDateKey(value);
  return (doctor.unavailablePeriods || []).some((period) => {
    if (!period.startDate || !period.endDate) return false;
    return target >= getDhakaDateKey(period.startDate) && target <= getDhakaDateKey(period.endDate);
  });
};

export const makeSlotKey = ({ doctorProfileId, dateKey, mode, slotId, startTime, serial }) => [
  doctorProfileId,
  dateKey,
  mode,
  slotId || "window",
  mode === "chamber" ? `serial-${serial}` : startTime,
].join(":");

export const normalizeBangladeshPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits)) return `88${digits}`;
  if (/^8801\d{9}$/.test(digits)) return digits;
  return null;
};

export const normalizeWeeklyAvailability = (days = []) => {
  if (!Array.isArray(days)) throw new Error("Weekly availability must be an array.");
  return days.map((day) => {
    const dayOfWeek = Number(day.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) throw new Error("Invalid weekday in availability.");
    const slots = (Array.isArray(day.slots) ? day.slots : []).map((slot) => {
      const consultationMode = ["chamber", "online", "home-visit"].includes(slot.consultationMode)
        ? slot.consultationMode
        : "chamber";
      const normalized = {
        ...slot,
        consultationMode,
        calculationMethod: slot.calculationMethod === "capacity" ? "capacity" : "duration",
        slotDurationMinutes: Math.max(5, Number(slot.slotDurationMinutes || 30)),
        maxPatientsPerWindow: Math.max(1, Number(slot.maxPatientsPerWindow || slot.maxPatientsPerSlot || 1)),
        maxPatientsPerSlot: 1,
        bufferMinutes: Math.max(0, Number(slot.bufferMinutes || 0)),
      };
      const plan = getWindowPlan(normalized);
      if (!plan.valid) throw new Error(`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]}: ${plan.error}`);
      return normalized;
    });

    for (const consultationMode of ["chamber", "online", "home-visit"]) {
      const ordered = slots
        .filter((slot) => slot.consultationMode === consultationMode)
        .map((slot) => ({ slot, start: timeToMinutes(slot.startTime), end: timeToMinutes(slot.endTime) }))
        .sort((a, b) => a.start - b.start);
      for (let index = 1; index < ordered.length; index += 1) {
        if (ordered[index].start < ordered[index - 1].end) {
          const modeLabel = consultationMode === "home-visit" ? "Home visit" : consultationMode.charAt(0).toUpperCase() + consultationMode.slice(1);
          throw new Error(`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]} has overlapping ${modeLabel} availability ranges.`);
        }
      }
    }
    return { dayOfWeek, isAvailable: slots.length > 0, slots };
  });
};

export { ACTIVE_BOOKING_STATUSES };
