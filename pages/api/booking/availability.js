import nextConnect from "next-connect";
import mongoose from "mongoose";
import db from "@/database/connection";
import Doctor from "@/database/model/Doctor";
import Booking from "@/database/model/Booking";
import { generateSubSlots, getDhakaDayOfWeek, getWindowPlan, isUnavailableDate, minutesToTime } from "@/utility/booking";

const handler = nextConnect();
const MODE_KEYS = { chamber: "chamber", online: "online", "home-visit": "homeVisit" };
const NON_HOLD_ACTIVE_STATUSES = ["payment-verification-pending", "pending", "confirmed", "reschedule-requested", "rescheduled"];

handler.get(async (req, res) => {
  try {
    const { doctorProfileId, date, mode } = req.query;
    if (!mongoose.Types.ObjectId.isValid(doctorProfileId) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) || !MODE_KEYS[mode]) {
      return res.status(400).json({ error: "Doctor, date and consultation mode are required." });
    }
    await db.connect();
    const doctor = await Doctor.findById(doctorProfileId).lean();
    if (!doctor || doctor.status !== "active") return res.status(404).json({ error: "Doctor is unavailable." });
    const modeConfig = doctor.consultationModes?.[MODE_KEYS[mode]];
    const hasScheduledMode = (doctor.weeklyAvailability || []).some((day) =>
      day.isAvailable && (day.slots || []).some((slot) => slot.consultationMode === mode)
    );
    if (!modeConfig?.enabled && !hasScheduledMode) return res.status(400).json({ error: "This consultation mode is not enabled." });

    const appointmentDate = new Date(`${date}T00:00:00+06:00`);
    if (Number.isNaN(appointmentDate.getTime())) return res.status(400).json({ error: "Invalid appointment date." });
    const today = new Date();
    const selectedEnd = new Date(appointmentDate.getTime() + 86400000);
    if (selectedEnd <= today) return res.status(400).json({ error: "Past dates are unavailable." });
    const maxDate = new Date(Date.now() + Number(doctor.bookingSettings?.advanceBookingDays || 30) * 86400000);
    if (appointmentDate > maxDate) return res.status(400).json({ error: "This date is outside the advance booking window." });
    if (isUnavailableDate(doctor, appointmentDate)) {
      return res.status(200).json({ date, mode, fee: Number(modeConfig.fee || 0), windows: [], unavailable: true });
    }

    const day = (doctor.weeklyAvailability || []).find((item) => Number(item.dayOfWeek) === getDhakaDayOfWeek(appointmentDate));
    const windows = day?.isAvailable === false ? [] : (day?.slots || []).filter((slot) => slot.consultationMode === mode);
    const existing = await Booking.find({
      doctorProfile: doctor._id,
      appointmentDate: { $gte: appointmentDate, $lt: new Date(appointmentDate.getTime() + 86400000) },
      consultationMode: mode,
      $or: [
        { status: { $in: NON_HOLD_ACTIVE_STATUSES } },
        { status: "awaiting-payment", paymentHoldExpiresAt: { $gt: new Date() } },
      ],
    }).select("availabilitySlotId startTime serial status").lean();

    const availability = windows.map((slot) => {
      const plan = getWindowPlan(slot);
      if (!plan.valid) return null;
      const slotId = String(slot._id);
      const bookedForWindow = existing.filter((booking) => String(booking.availabilitySlotId || "") === slotId);
      if (mode === "chamber") {
        const used = bookedForWindow.length;
        const nextSerial = used + 1;
        const estimatedStart = plan.start + (nextSerial - 1) * (plan.durationMinutes + plan.bufferMinutes);
        return { slotId, startTime: slot.startTime, endTime: slot.endTime, capacity: plan.capacity, remaining: Math.max(0, plan.capacity - used), nextSerial, estimatedStartTime: minutesToTime(estimatedStart), estimatedEndTime: minutesToTime(estimatedStart + plan.durationMinutes), averageMinutes: plan.durationMinutes, bufferMinutes: plan.bufferMinutes };
      }
      const bookedTimes = new Set(bookedForWindow.map((booking) => booking.startTime));
      const minimumStart = Date.now() + Number(doctor.bookingSettings?.minimumNoticeMinutes || 0) * 60000;
      return {
        slotId, startTime: slot.startTime, endTime: slot.endTime, capacity: plan.capacity,
        remaining: Math.max(0, plan.capacity - bookedForWindow.length), averageMinutes: plan.durationMinutes, bufferMinutes: plan.bufferMinutes,
        subSlots: generateSubSlots(slot).map((subSlot) => {
          const startsAt = new Date(`${date}T${subSlot.startTime}:00+06:00`).getTime();
          return { ...subSlot, available: !bookedTimes.has(subSlot.startTime) && startsAt >= minimumStart };
        }),
      };
    }).filter(Boolean);

    return res.status(200).json({ date, mode, fee: Number(modeConfig.fee || 0), windows: availability, unavailable: false });
  } catch (error) {
    console.error("Availability error", error);
    return res.status(500).json({ error: "Failed to load availability." });
  }
});

export default handler;
