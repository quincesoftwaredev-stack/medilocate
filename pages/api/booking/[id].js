import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import { consultationConfig } from "@/config";
import { getConsultationTime } from "@/utility/booking";
import { cancelConsultationReminder, scheduleConsultationReminder } from "@/services/qstash-consultation-reminder";

const handler = nextConnect();
handler.use(isAuth);

const canAccess = (booking, user) => user.role === "admin"
  || (user.role === "patient" && String(booking.patient?._id || booking.patient) === String(user._id))
  || (user.role === "doctor" && String(booking.doctor?._id || booking.doctor) === String(user._id));

handler.get(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(400).json({ error: "Invalid booking ID." });
    await db.connect();
    const booking = await Booking.findById(req.query.id)
      .populate("patient", "fullName phone image")
      .populate("doctor", "fullName phone image speciality workingIn")
      .populate("payment");
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canAccess(booking, req.user)) return res.status(403).json({ error: "Not authorized." });
    return res.status(200).json({ ...booking.toObject(), joinBeforeMinutes: consultationConfig.joinBeforeMinutes.online });
  } catch (error) {
    console.error("Booking details error", error);
    return res.status(500).json({ error: "Failed to load booking." });
  }
});

handler.patch(async (req, res) => {
  try {
    const { id } = req.query;
    const action = req.body.action;
    if (!mongoose.Types.ObjectId.isValid(id) || !["confirm", "complete", "no-show", "cancel", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid booking action." });
    }
    await db.connect();
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canAccess(booking, req.user)) return res.status(403).json({ error: "Not authorized." });
    const isDoctorOrAdmin = req.user.role === "admin" || String(booking.doctor) === String(req.user._id);
    if (["confirm", "complete", "no-show", "reject"].includes(action) && !isDoctorOrAdmin) return res.status(403).json({ error: "Only the doctor or admin can perform this action." });
    if (["completed", "cancelled", "rejected", "no-show"].includes(booking.status)) return res.status(409).json({ error: "This booking is already final." });

    if (action === "confirm") {
      if (booking.paymentStatus !== "paid" || !["pending", "rescheduled"].includes(booking.status)) return res.status(409).json({ error: "Payment must be verified and booking pending." });
      booking.status = "confirmed";
    } else if (action === "complete") {
      if (!["confirmed", "rescheduled", "waiting", "ongoing"].includes(booking.status)) return res.status(409).json({ error: "The appointment is not ready to complete." });
      if (getConsultationTime(booking) > new Date()) return res.status(409).json({ error: "The appointment has not started yet." });
      booking.endedAt ||= new Date();
      booking.status = "completed";
      booking.completedAt = new Date();
    } else if (action === "no-show") {
      if (!["confirmed", "rescheduled", "waiting"].includes(booking.status) || getConsultationTime(booking) > new Date()) return res.status(409).json({ error: "No-show is only available after the appointment starts." });
      booking.status = "no-show";
    } else {
      if (action === "reject" && !["awaiting-payment", "payment-verification-pending", "pending"].includes(booking.status)) return res.status(409).json({ error: "Only pending bookings can be rejected." });
      if (action === "cancel" && booking.status === "ongoing") return res.status(409).json({ error: "Finish the ongoing consultation instead." });
      booking.status = action === "reject" ? "rejected" : "cancelled";
      booking.slotKey = undefined;
      booking.cancellation = {
        reason: String(req.body.reason || (action === "reject" ? "Appointment rejected." : "Booking cancelled.")).trim().slice(0, 500),
        cancelledBy: req.user._id,
        cancelledAt: new Date(),
        refundRequired: booking.paymentStatus === "paid",
      };
      if (booking.paymentStatus === "paid") booking.paymentStatus = "refund-pending";
    }
    booking.statusTimeline.push({ status: booking.status, changedBy: req.user._id, note: booking.cancellation?.reason || "" });
    await booking.save();
    try {
      if (action === "confirm") {
        const reminder = await scheduleConsultationReminder(booking);
        if (reminder.messageId) {
          booking.qstashReminderMessageId = reminder.messageId;
          booking.qstashReminderScheduledFor = reminder.scheduledFor;
          await booking.save();
        }
      } else if (["complete", "no-show", "cancel", "reject"].includes(action)) {
        await cancelConsultationReminder(booking.qstashReminderMessageId);
        booking.qstashReminderMessageId = "";
        booking.qstashReminderScheduledFor = null;
        await booking.save();
      }
    } catch (error) {
      console.error("Booking reminder update failed", { bookingId: String(booking._id), reason: error.message });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Booking action error", error);
    return res.status(500).json({ error: "Failed to update booking." });
  }
});

export default handler;
