import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import Doctor from "@/database/model/Doctor";
import { generateSubSlots, getDhakaDateKey, getDhakaDayOfWeek, getWindowPlan, isUnavailableDate, makeSlotKey, minutesToTime } from "@/utility/booking";
import { scheduleConsultationReminder } from "@/services/qstash-consultation-reminder";

const handler = nextConnect();
handler.use(isAuth);

const participantRole = (booking, user) => {
  if (user.role === "admin") return "admin";
  if (String(booking.patient) === String(user._id)) return "patient";
  if (String(booking.doctor) === String(user._id)) return "doctor";
  return null;
};

const resolveProposal = async (booking, doctor, body) => {
  const appointmentDate = new Date(`${body.date}T00:00:00+06:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.date || "")) || new Date(appointmentDate.getTime() + 86400000) <= new Date()) throw new Error("Select a future date.");
  if (isUnavailableDate(doctor, appointmentDate)) throw new Error("The doctor is unavailable on this date.");
  const day = doctor.weeklyAvailability.find((item) => Number(item.dayOfWeek) === getDhakaDayOfWeek(appointmentDate));
  const window = day?.slots?.id(body.availabilitySlotId);
  if (!window || (window.consultationMode === "home-visit" ? "home" : window.consultationMode) !== booking.consultationType) throw new Error("Select a valid availability window.");
  const plan = getWindowPlan(window);
  if (!plan.valid) throw new Error(plan.error);
  const query = {
    _id: { $ne: booking._id }, doctorProfile: doctor._id,
    appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) },
    availabilitySlotId: window._id,
    $or: [
      { status: { $in: ["payment-verification-pending", "pending", "confirmed", "reschedule-requested", "rescheduled", "waiting", "ongoing"] } },
      { status: "awaiting-payment", paymentHoldExpiresAt: { $gt: new Date() } },
    ],
  };
  const existing = await Booking.find(query).select("startTime endTime serial consultationMode availabilitySlotId").lean();
  const sameWindow = existing.filter((item) => String(item.availabilitySlotId) === String(window._id) && item.consultationMode === booking.consultationMode);
  if (booking.consultationMode === "chamber") {
    if (sameWindow.length >= plan.capacity) throw new Error("This chamber session is full.");
    const used = new Set(sameWindow.map((item) => item.serial));
    const serial = Array.from({ length: plan.capacity }, (_, index) => index + 1).find((value) => !used.has(value));
    const estimatedStart = plan.start + (serial - 1) * (plan.durationMinutes + plan.bufferMinutes);
    const startTime = minutesToTime(estimatedStart), endTime = minutesToTime(estimatedStart + plan.durationMinutes);
    if (new Date(`${body.date}T${startTime}:00+06:00`).getTime() < Date.now() + Number(doctor.bookingSettings?.minimumNoticeMinutes || 0) * 60000) throw new Error("The selected appointment is too close to reschedule.");
    if (existing.some((item) => item.consultationMode !== "chamber" && item.startTime < endTime && item.endTime > startTime)) throw new Error("The doctor is booked at this time.");
    return { appointmentDate, availabilitySlotId: window._id, startTime, endTime, sessionStartTime: window.startTime, sessionEndTime: window.endTime, serial };
  }
  const subSlot = generateSubSlots(window).find((item) => item.startTime === body.startTime);
  if (!subSlot || existing.some((item) => item.startTime < subSlot.endTime && item.endTime > subSlot.startTime)) throw new Error("That appointment time is unavailable.");
  if (new Date(`${body.date}T${subSlot.startTime}:00+06:00`).getTime() < Date.now() + Number(doctor.bookingSettings?.minimumNoticeMinutes || 0) * 60000) throw new Error("The selected appointment is too close to reschedule.");
  return { appointmentDate, availabilitySlotId: window._id, ...subSlot, sessionStartTime: window.startTime, sessionEndTime: window.endTime, serial: null };
};

handler.post(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !mongoose.Types.ObjectId.isValid(req.body.availabilitySlotId)) return res.status(400).json({ error: "Invalid reschedule request." });
    await db.connect();
    const booking = await Booking.findById(req.query.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    const role = participantRole(booking, req.user);
    if (!role) return res.status(403).json({ error: "Not authorized." });
    if (["completed", "cancelled", "no-show", "rejected"].includes(booking.status) || booking.activeRescheduleRequest?.status === "pending") return res.status(409).json({ error: "This booking cannot be rescheduled now." });
    const doctor = await Doctor.findById(booking.doctorProfile);
    if (booking.rescheduleCount >= Number(doctor?.bookingSettings?.maxReschedules ?? 2)) return res.status(409).json({ error: "The reschedule limit has been reached." });
    const proposal = await resolveProposal(booking, doctor, req.body);
    booking.activeRescheduleRequest = { ...proposal, requestedBy: req.user._id, reason: String(req.body.reason || "").trim().slice(0, 500) };
    booking.status = "reschedule-requested";
    booking.statusTimeline.push({ status: booking.status, changedBy: req.user._id });
    await booking.save();
    return res.status(201).json(booking);
  } catch (error) {
    console.error("Reschedule request error", error);
    return res.status(400).json({ error: error.message || "Failed to request reschedule." });
  }
});

handler.patch(async (req, res) => {
  try {
    await db.connect();
    const booking = await Booking.findById(req.query.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    const role = participantRole(booking, req.user);
    const proposal = booking.activeRescheduleRequest;
    if (!role || !proposal || proposal.status !== "pending") return res.status(409).json({ error: "No pending reschedule request." });
    if (String(proposal.requestedBy) === String(req.user._id) && role !== "admin") return res.status(403).json({ error: "The other party must respond." });
    if (!["accept", "decline"].includes(req.body.action)) return res.status(400).json({ error: "Choose accept or decline." });
    proposal.status = req.body.action === "accept" ? "accepted" : "declined";
    proposal.respondedBy = req.user._id;
    proposal.respondedAt = new Date();
    if (req.body.action === "accept") {
      if (!proposal.availabilitySlotId) {
        const doctor = await Doctor.findById(booking.doctorProfile);
        const day = doctor?.weeklyAvailability?.find((item) => Number(item.dayOfWeek) === getDhakaDayOfWeek(proposal.appointmentDate));
        const window = day?.slots?.find((item) => item.startTime === proposal.sessionStartTime && item.endTime === proposal.sessionEndTime
          && (item.consultationMode === "home-visit" ? "home" : item.consultationMode) === booking.consultationType);
        if (!window) return res.status(409).json({ error: "The old availability window no longer exists. Request a new slot." });
        proposal.availabilitySlotId = window._id;
      }
      const dateStart = new Date(`${getDhakaDateKey(proposal.appointmentDate)}T00:00:00+06:00`);
      await Booking.updateMany({ doctorProfile: booking.doctorProfile, appointmentDate: { $gte: dateStart, $lt: new Date(dateStart.getTime() + 86400000) }, status: "awaiting-payment", paymentHoldExpiresAt: { $lte: new Date() } }, { $set: { status: "cancelled" }, $unset: { slotKey: "" } });
      await Booking.updateMany({ doctorProfile: booking.doctorProfile, appointmentDate: { $gte: dateStart, $lt: new Date(dateStart.getTime() + 86400000) }, status: { $in: ["cancelled", "rejected"] }, slotKey: { $exists: true } }, { $unset: { slotKey: "" } });
      const conflict = await Booking.exists({
        _id: { $ne: booking._id }, doctorProfile: booking.doctorProfile,
        appointmentDate: { $gte: dateStart, $lt: new Date(dateStart.getTime() + 86400000) },
        startTime: { $lt: proposal.endTime }, endTime: { $gt: proposal.startTime },
        status: { $in: ["awaiting-payment", "payment-verification-pending", "pending", "confirmed", "reschedule-requested", "rescheduled", "waiting", "ongoing"] },
        ...(booking.consultationType === "chamber" ? { $or: [
          { consultationMode: { $ne: "chamber" } },
          { availabilitySlotId: proposal.availabilitySlotId, serial: proposal.serial },
        ] } : {}),
      });
      if (conflict) return res.status(409).json({ error: "That appointment time was booked while the reschedule was pending." });
      booking.appointmentDate = proposal.appointmentDate;
      booking.availabilitySlotId = proposal.availabilitySlotId;
      booking.startTime = proposal.startTime;
      booking.endTime = proposal.endTime;
      booking.sessionStartTime = proposal.sessionStartTime;
      booking.sessionEndTime = proposal.sessionEndTime;
      booking.serial = proposal.serial;
      booking.slotKey = makeSlotKey({ doctorProfileId: booking.doctorProfile, dateKey: getDhakaDateKey(proposal.appointmentDate), mode: booking.consultationMode, slotId: proposal.availabilitySlotId, startTime: proposal.startTime, serial: proposal.serial });
      booking.rescheduleCount += 1;
      booking.smsReminderSent = { patient: false, doctor: false, manager: false };
      booking.smsReminderSentAt = null;
      booking.status = "rescheduled";
    } else {
      booking.status = booking.paymentStatus === "paid" ? "confirmed" : "pending";
    }
    booking.rescheduleHistory.push(proposal.toObject());
    booking.activeRescheduleRequest = null;
    booking.statusTimeline.push({ status: booking.status, changedBy: req.user._id });
    await booking.save();
    if (req.body.action === "accept") {
      try {
        const reminder = await scheduleConsultationReminder(booking);
        if (reminder.messageId) {
          booking.qstashReminderMessageId = reminder.messageId;
          booking.qstashReminderScheduledFor = reminder.scheduledFor;
          await booking.save();
        }
      } catch (error) {
        console.error("Rescheduled booking reminder update failed", { bookingId: String(booking._id), reason: error.message });
      }
    }
    return res.status(200).json(booking);
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "That appointment time is no longer available." });
    console.error("Reschedule response error", error);
    return res.status(500).json({ error: "Failed to respond to reschedule request." });
  }
});

export default handler;
