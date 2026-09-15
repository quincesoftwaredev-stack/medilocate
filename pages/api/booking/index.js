import nextConnect from "next-connect";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import { scheduleConsultationReminder } from "@/services/qstash-consultation-reminder";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import BookingPayment from "@/database/model/BookingPayment";
import Doctor from "@/database/model/Doctor";
import User from "@/database/model/User";
import {
  ACTIVE_BOOKING_STATUSES,
  generateSubSlots,
  getDhakaDateKey,
  getDoctorModeConfig,
  getDhakaDayOfWeek,
  getWindowPlan,
  isUnavailableDate,
  makeSlotKey,
  minutesToTime,
  normalizeBangladeshPhone,
} from "@/utility/booking";

const handler = nextConnect();
const PAGE_SIZE = 10;
const MODE_KEYS = { chamber: "chamber", online: "online", home: "home", "home-visit": "home" };
const canonicalMode = (mode) => mode === "home-visit" ? "home" : mode;
const matchesMode = (slotMode, selectedMode) => canonicalMode(slotMode) === canonicalMode(selectedMode);

handler.get(isAuth, async (req, res) => {
  try {
    await db.connect();
    const page = Math.max(1, Number(req.query.page || 1));
    const filter = req.user.role === "admin"
      ? {}
      : req.user.role === "doctor"
        ? { doctor: req.user._id }
        : { patient: req.user._id };
    if (req.query.status && req.query.status !== "all") filter.status = req.query.status;
    if (req.query.mode && req.query.mode !== "all") {
      const mode = canonicalMode(req.query.mode);
      filter.$and = [...(filter.$and || []), { $or: [
        { consultationType: mode },
        { consultationMode: { $in: mode === "home" ? ["home", "home-visit"] : [mode] } },
      ] }];
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== "all") filter.paymentStatus = req.query.paymentStatus;
    if (req.query.range === "today" || req.query.range === "upcoming") {
      const key = getDhakaDateKey(new Date());
      const beginning = new Date(`${key}T00:00:00+06:00`);
      filter.appointmentDate = req.query.range === "today"
        ? { $gte: beginning, $lt: new Date(beginning.getTime() + 86400000) } : { $gte: beginning };
      if (req.query.range === "upcoming" && !filter.status) filter.status = { $nin: ["completed", "cancelled", "rejected", "no-show"] };
    }
    if (req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)) {
      const start = new Date(`${req.query.date}T00:00:00+06:00`);
      filter.appointmentDate = { $gte: start, $lt: new Date(start.getTime() + 86400000) };
    }
    if (req.user.role === "admin") {
      for (const [parameter, field] of [["doctorQuery", "doctor"], ["patientQuery", "patient"]]) {
        const value = String(req.query[parameter] || "").trim().slice(0, 80);
        if (!value) continue;
        const safe = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const users = await User.find({ fullName: { $regex: safe, $options: "i" } }).select("_id").limit(100).lean();
        filter[field] = { $in: users.map((user) => user._id) };
      }
    }
    if (String(req.query.query || "").trim()) {
      const search = String(req.query.query).trim();
      const phoneSearch = search.replace(/[^\d+]/g, "");
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          ...(phoneSearch ? [{ phoneNumber: { $regex: phoneSearch, $options: "i" } }] : []),
        ],
      }).select("_id").limit(100).lean();
      const userIds = matchingUsers.map((user) => user._id);
      filter.$and = [...(filter.$and || []), {
        $or: [
          { patient: { $in: userIds } },
          { doctor: { $in: userIds } },
          { patientName: { $regex: search, $options: "i" } },
          ...(mongoose.Types.ObjectId.isValid(search) ? [{ _id: search }] : []),
        ],
      }];
    }
    const count = await Booking.countDocuments(filter);
    const bookingDocuments = await Booking.find(filter)
      .populate("patient", "fullName phoneNumber image")
      .populate("doctor", "fullName phoneNumber image speciality")
      .populate("payment")
      .populate("doctorProfile", "chambers")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);
    const fallbackPayments = await BookingPayment.find({
      booking: { $in: bookingDocuments.filter((booking) => !booking.payment).map((booking) => booking._id) },
    }).lean();
    const paymentByBooking = new Map(fallbackPayments.map((payment) => [String(payment.booking), payment]));
    const bookings = bookingDocuments.map((booking) => {
      const result = booking.toObject();
      if (!result.payment) result.payment = paymentByBooking.get(String(result._id)) || null;
      return result;
    });
    return res.status(200).json({ page, totalPages: Math.ceil(count / PAGE_SIZE), count, bookings });
  } catch (error) {
    console.error("Booking list error", error);
    return res.status(500).json({ error: "Failed to load bookings." });
  }
});

handler.post(isAuth, async (req, res) => {
  try {
    const { doctorProfileId, date, availabilitySlotId, startTime, patientName, symptoms, patientNotes, homeVisitAddress } = req.body;
    const consultationMode = canonicalMode(req.body.consultationType || req.body.consultationMode);
    if (!mongoose.Types.ObjectId.isValid(doctorProfileId) || !mongoose.Types.ObjectId.isValid(availabilitySlotId)) {
      return res.status(400).json({ error: "Select a valid doctor and availability window." });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || !MODE_KEYS[consultationMode]) {
      return res.status(400).json({ error: "Select a valid date and consultation mode." });
    }
    await db.connect();
    const [doctor, patient] = await Promise.all([
      Doctor.findById(doctorProfileId),
      User.findById(req.user._id).select("fullName phone role"),
    ]);
    if (!doctor || doctor.status !== "active") return res.status(404).json({ error: "Doctor is unavailable." });
    if (!patient || patient.role !== "patient") return res.status(403).json({ error: "A patient account is required." });

    const modeConfig = getDoctorModeConfig(doctor, consultationMode);
    const hasScheduledMode = doctor.weeklyAvailability.some((day) =>
      day.isAvailable && day.slots.some((slot) => matchesMode(slot.consultationMode, consultationMode))
    );
    if (!modeConfig?.enabled && !hasScheduledMode) return res.status(400).json({ error: "This consultation mode is not enabled." });
    const appointmentDate = new Date(`${date}T00:00:00+06:00`);
    if (new Date(appointmentDate.getTime() + 86400000) <= new Date() || isUnavailableDate(doctor, appointmentDate)) {
      return res.status(400).json({ error: "This date is unavailable." });
    }
    const maxDate = new Date(Date.now() + Number(doctor.bookingSettings?.advanceBookingDays || 30) * 86400000);
    if (appointmentDate > maxDate) return res.status(400).json({ error: "This date is outside the advance booking window." });
    const day = doctor.weeklyAvailability.find((item) => Number(item.dayOfWeek) === getDhakaDayOfWeek(appointmentDate));
    const window = day?.slots?.id(availabilitySlotId);
    if (!window || !matchesMode(window.consultationMode, consultationMode)) return res.status(400).json({ error: "The selected availability window no longer exists." });
    const availableChambers = doctor.chambers.filter((item) => item.isActive !== false);
    const selectedChamber = consultationMode === "chamber"
      ? doctor.chambers.id(window.chamberId) || (availableChambers.length === 1 ? availableChambers[0] : null) : null;
    if (consultationMode === "chamber" && (!selectedChamber || selectedChamber.isActive === false)) return res.status(400).json({ error: "Select an active chamber for this appointment." });
    const plan = getWindowPlan(window);
    if (!plan.valid) return res.status(400).json({ error: plan.error });

    // Release abandoned holds so their unique slot keys can be reused.
    await Booking.updateMany({ doctorProfile: doctor._id, appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) }, status: "awaiting-payment", paymentHoldExpiresAt: { $lte: new Date() } }, { $set: { status: "cancelled" }, $unset: { slotKey: "" } });
    await Booking.updateMany({ doctorProfile: doctor._id, appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) }, status: { $in: ["cancelled", "rejected"] }, slotKey: { $exists: true } }, { $unset: { slotKey: "" } });
    const activeQuery = {
      doctorProfile: doctor._id,
      appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) },
      consultationMode: { $in: consultationMode === "home" ? ["home", "home-visit"] : [consultationMode] },
      availabilitySlotId: window._id,
      $or: [
        { status: { $in: ACTIVE_BOOKING_STATUSES.filter((status) => status !== "awaiting-payment") } },
        { status: "awaiting-payment", paymentHoldExpiresAt: { $gt: new Date() } },
      ],
    };
    const dayActive = await Booking.countDocuments({
      doctorProfile: doctor._id, appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) },
      $or: [
        { status: { $in: ACTIVE_BOOKING_STATUSES.filter((status) => status !== "awaiting-payment") } },
        { status: "awaiting-payment", paymentHoldExpiresAt: { $gt: new Date() } },
      ],
    });
    if (dayActive >= Number(doctor.bookingSettings?.maxPatientsPerDay || 30)) return res.status(409).json({ error: "The doctor is fully booked for this date." });
    const existing = await Booking.find(activeQuery).select("startTime serial").lean();
    let finalStartTime;
    let finalEndTime;
    let serial = null;
    if (consultationMode === "chamber") {
      if (existing.length >= plan.capacity) return res.status(409).json({ error: "This chamber session is full." });
      const usedSerials = new Set(existing.map((item) => item.serial));
      serial = Array.from({ length: plan.capacity }, (_, index) => index + 1).find((value) => !usedSerials.has(value));
      const estimatedStart = plan.start + (serial - 1) * (plan.durationMinutes + plan.bufferMinutes);
      finalStartTime = minutesToTime(estimatedStart);
      finalEndTime = minutesToTime(estimatedStart + plan.durationMinutes);
      if (new Date(`${date}T${finalStartTime}:00+06:00`).getTime() < Date.now() + Number(doctor.bookingSettings?.minimumNoticeMinutes || 0) * 60000) return res.status(409).json({ error: "This chamber session is too close to book." });
    } else {
      const subSlot = generateSubSlots(window).find((item) => item.startTime === startTime);
      if (!subSlot) return res.status(400).json({ error: "Select a valid appointment time." });
      const startsAt = new Date(`${date}T${subSlot.startTime}:00+06:00`).getTime();
      if (startsAt < Date.now() + Number(doctor.bookingSettings?.minimumNoticeMinutes || 0) * 60000) return res.status(409).json({ error: "This appointment time is too close to book." });
      if (existing.some((item) => item.startTime === subSlot.startTime)) return res.status(409).json({ error: "That appointment time was just booked." });
      finalStartTime = subSlot.startTime;
      finalEndTime = subSlot.endTime;
    }

    const scheduledAt = new Date(`${date}T${finalStartTime}:00+06:00`);
    const slotEnd = new Date(`${date}T${finalEndTime}:00+06:00`);
    const overlapping = await Booking.exists({
      doctorProfile: doctor._id,
      appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) },
      startTime: { $lt: finalEndTime }, endTime: { $gt: finalStartTime },
      $or: [
        { status: { $in: ACTIVE_BOOKING_STATUSES.filter((status) => status !== "awaiting-payment") } },
        { status: "awaiting-payment", paymentHoldExpiresAt: { $gt: new Date() } },
      ],
      ...(consultationMode === "chamber" ? { consultationMode: { $ne: "chamber" } } : {}),
    });
    if (overlapping) return res.status(409).json({ error: "The doctor is already booked at this time." });
    const fee = Number(modeConfig?.fee ?? doctor.consultationFee ?? 0);
    const platformFeePercent = Number(doctor.platformFeePercent || 0);
    const platformFeeAmount = Number(((fee * platformFeePercent) / 100).toFixed(2));
    const bookingId = new mongoose.Types.ObjectId();
    const booking = await Booking.create({
      _id: bookingId,
      patient: patient._id,
      doctor: doctor.user,
      doctorProfile: doctor._id,
      department: doctor.departments?.[0] || null,
      chamberId: selectedChamber?._id || null,
      availabilitySlotId: window._id,
      slotKey: makeSlotKey({ doctorProfileId: doctor._id, dateKey: getDhakaDateKey(appointmentDate), mode: consultationMode, slotId: window._id, startTime: finalStartTime, serial }),
      appointmentDate,
      startTime: finalStartTime,
      endTime: finalEndTime,
      sessionStartTime: window.startTime,
      sessionEndTime: window.endTime,
      serial,
      consultationMode: canonicalMode(consultationMode),
      consultationType: canonicalMode(consultationMode),
      scheduledAt, slotStart: scheduledAt, slotEnd,
      duration: Math.round((slotEnd - scheduledAt) / 60000),
      roomName: consultationMode === "online" ? `consultation_${bookingId}_${randomBytes(12).toString("hex")}` : "",
      consultationFee: fee,
      platformFeePercent,
      platformFeeAmount,
      doctorPayableAmount: fee - platformFeeAmount,
      patientName: String(patientName || patient.fullName || "").trim(),
      patientPhone: normalizeBangladeshPhone(patient.phone) || patient.phone,
      symptoms: String(symptoms || "").trim(),
      patientNotes: String(patientNotes || "").trim(),
      homeVisitAddress: canonicalMode(consultationMode) === "home" ? homeVisitAddress : undefined,
      paymentHoldExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    try {
      const reminder = await scheduleConsultationReminder(booking);
      if (reminder.messageId) {
        booking.qstashReminderMessageId = reminder.messageId;
        booking.qstashReminderScheduledFor = reminder.scheduledFor;
        await booking.save();
      }
    } catch (error) {
      console.error("New booking reminder scheduling failed", { bookingId: String(booking._id), reason: error.message });
    }
    return res.status(201).json(booking);
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "That appointment is no longer available." });
    console.error("Booking creation error", error);
    return res.status(500).json({ error: error?.message || "Failed to create booking." });
  }
});

export default handler;
