import Booking from "@/database/model/Booking";
import Message from "@/services/message-service";
import { consultationConfig } from "@/config";
import { getConsultationTime, normalizeBangladeshPhone } from "@/utility/booking";

const ROLES = ["patient", "doctor", "manager"];
const ELIGIBLE = ["pending", "confirmed", "rescheduled", "waiting"];
const typeOf = (booking) => booking.consultationType || (booking.consultationMode === "home-visit" ? "home" : booking.consultationMode);

export const getConsultationReminderMinutes = (type) =>
  Math.max(0, Number(consultationConfig.reminderBeforeMinutes[type] ?? 5));

export const shouldSendConsultationReminder = (booking, now = new Date()) => {
  const startsAt = getConsultationTime(booking);
  if (!startsAt || !ELIGIBLE.includes(booking.status) || booking.paymentStatus !== "paid") return false;
  const reminderAt = startsAt.getTime() - getConsultationReminderMinutes(typeOf(booking)) * 60000;
  // Stop after the appointment start; late jobs must not send a stale reminder.
  return now.getTime() >= reminderAt && now.getTime() < startsAt.getTime();
};

const formatTime = (date) => new Intl.DateTimeFormat("en-BD", {
  timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit", hour12: true,
}).format(date);
const doctorName = (booking) => booking.doctor?.fullName || "your doctor";
const patientName = (booking) => booking.patientName || booking.patient?.fullName || "the patient";

export const buildConsultationReminder = (booking, role) => {
  const type = typeOf(booking);
  const time = formatTime(getConsultationTime(booking));
  const doctor = doctorName(booking), patient = patientName(booking), id = String(booking._id).slice(-8);
  if (type === "online") {
    if (role === "patient") return `MediLocate Reminder: Your online consultation with Dr. ${doctor} starts at ${time}. Please be ready to join.`;
    if (role === "doctor") return `MediLocate Reminder: Your online consultation with ${patient} starts at ${time}. Please be ready to join.`;
    return `MediLocate: Online consultation ${id} between Dr. ${doctor} and ${patient} starts at ${time}.`;
  }
  if (type === "chamber") {
    if (role === "patient") return `MediLocate Reminder: Your chamber appointment with Dr. ${doctor} is at ${time}. Please arrive on time.`;
    if (role === "doctor") return `MediLocate Reminder: Chamber appointment with ${patient} is scheduled at ${time}.`;
    return `MediLocate: Chamber appointment ${id} with Dr. ${doctor} and ${patient} is at ${time}.`;
  }
  if (role === "patient") return `MediLocate Reminder: Dr. ${doctor}'s home consultation is scheduled at ${time}. Please remain available.`;
  if (role === "doctor") return `MediLocate Reminder: Home consultation with ${patient} is scheduled at ${time}. Check appointment details/address.`;
  return `MediLocate: Home consultation ${id} with Dr. ${doctor} and ${patient} is at ${time}.`;
};

const recipientNumber = (booking, role) => {
  if (role === "manager") return consultationConfig.managerPhone;
  const user = booking[role];
  return role === "patient"
    ? booking.patientPhone || user?.phone || user?.phoneNumber
    : user?.phone || user?.phoneNumber;
};

export async function sendConsultationReminders(booking, { sender = new Message(), now = new Date() } = {}) {
  if (!shouldSendConsultationReminder(booking, now)) return { eligible: false };
  const result = { eligible: true, sent: [], failed: [], skipped: [] };
  for (const role of ROLES) {
    const sendingKey = `smsReminderSending.${role}`;
    const sentKey = `smsReminderSent.${role}`;
    // Atomic short lease prevents two cron invocations from sending the same recipient.
    const claimed = await Booking.findOneAndUpdate({
      _id: booking._id, status: { $in: ELIGIBLE }, paymentStatus: "paid",
      [sentKey]: { $ne: true },
      $or: [{ [sendingKey]: null }, { [sendingKey]: { $lt: new Date(now.getTime() - 120000) } }],
    }, { $set: { [sendingKey]: now } }, { new: true })
      .populate("doctor", "fullName phone phoneNumber")
      .populate("patient", "fullName phone phoneNumber");
    if (!claimed) continue;
    try {
      if (!shouldSendConsultationReminder(claimed, now)) { result.skipped.push(role); continue; }
      const number = normalizeBangladeshPhone(recipientNumber(claimed, role));
      if (!number) throw new Error("Recipient phone is unavailable");
      const delivery = await sender.sendMessage({ number, message: buildConsultationReminder(claimed, role) });
      if (delivery?.skipped) { result.skipped.push(role); continue; }
      if (String(delivery?.response_code) !== "202" && delivery?.success !== true) throw new Error("SMS gateway did not accept the reminder");
      await Booking.updateOne({ _id: booking._id, [sendingKey]: now, [sentKey]: { $ne: true } }, {
        $set: { [sentKey]: true, smsReminderSentAt: new Date() }, $unset: { [sendingKey]: "" },
      });
      result.sent.push(role);
    } catch (error) {
      // Do not log phone numbers or medical message contents.
      console.error("Consultation reminder failed", { bookingId: String(booking._id), role, reason: error.message });
      result.failed.push(role);
    } finally {
      await Booking.updateOne({ _id: booking._id, [sendingKey]: now }, { $unset: { [sendingKey]: "" } });
    }
  }
  return result;
}
