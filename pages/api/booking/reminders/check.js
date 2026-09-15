import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import { sendConsultationReminders, shouldSendConsultationReminder } from "@/services/consultation-reminder";
import { consultationConfig } from "@/config";
import { getDhakaDateKey, getConsultationTime } from "@/utility/booking";

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: "Unauthorized." });
  try {
    await db.connect();
    const now = new Date();
    const horizon = new Date(now.getTime() + (Math.max(...Object.values(consultationConfig.reminderBeforeMinutes)) + 1) * 60000);
    const todayStart = new Date(`${getDhakaDateKey(now)}T00:00:00+06:00`);
    const common = {
      status: { $in: ["pending", "confirmed", "rescheduled", "waiting"] },
      paymentStatus: "paid",
      $or: [
        { "smsReminderSent.patient": { $ne: true } },
        { "smsReminderSent.doctor": { $ne: true } },
        { "smsReminderSent.manager": { $ne: true } },
      ],
    };
    const [scheduled, legacy] = await Promise.all([
      Booking.find({ ...common, scheduledAt: { $gt: now, $lte: horizon } })
        .populate("patient", "fullName phone phoneNumber").populate("doctor", "fullName phone phoneNumber")
        .sort({ scheduledAt: 1 }).limit(200),
      Booking.find({ ...common, scheduledAt: null, appointmentDate: { $gte: todayStart, $lt: new Date(todayStart.getTime() + 2 * 86400000) } })
        .populate("patient", "fullName phone phoneNumber").populate("doctor", "fullName phone phoneNumber")
        .sort({ appointmentDate: 1, startTime: 1 }).limit(200),
    ]);
    const bookings = [...scheduled, ...legacy];
    const eligible = bookings.filter((booking) => shouldSendConsultationReminder(booking, now))
      .sort((a, b) => getConsultationTime(a) - getConsultationTime(b)).slice(0, 10);
    const results = await Promise.all(eligible.map((booking) => sendConsultationReminders(booking, { now })));
    return res.status(200).json({
      checked: bookings.length, eligible: eligible.length,
      sent: results.reduce((sum, item) => sum + (item.sent?.length || 0), 0),
      failed: results.reduce((sum, item) => sum + (item.failed?.length || 0), 0),
      skipped: results.reduce((sum, item) => sum + (item.skipped?.length || 0), 0),
    });
  } catch (error) {
    console.error("Consultation reminder check failed", error);
    return res.status(500).json({ error: "Reminder check failed." });
  }
}
