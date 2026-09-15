import BASE_URL, { consultationConfig } from "@/config";
import { getConsultationTime } from "@/utility/booking";

const qstashUrl = () => String(process.env.QSTASH_URL || "https://qstash.upstash.io").replace(/\/$/, "");
const appointmentType = (booking) => booking.consultationType || (booking.consultationMode === "home-visit" ? "home" : booking.consultationMode);

export async function cancelConsultationReminder(messageId) {
  if (!messageId || !process.env.QSTASH_TOKEN) return false;
  const response = await fetch(qstashUrl() + "/v2/messages", {
    method: "DELETE",
    headers: { Authorization: "Bearer " + process.env.QSTASH_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ messageIds: [messageId] }),
  });
  if (!response.ok && response.status !== 404) throw new Error("QStash reminder cancellation failed (" + response.status + ").");
  return response.ok;
}

export async function scheduleConsultationReminder(booking) {
  if (!process.env.QSTASH_TOKEN) throw new Error("QStash token is not configured.");
  const callbackBaseUrl = String(process.env.QSTASH_CALLBACK_BASE_URL || BASE_URL).replace(/\/$/, "");
  if (!callbackBaseUrl.startsWith("https://")) return { skipped: true, reason: "public-https-url-required" };
  const startsAt = getConsultationTime(booking);
  if (!startsAt || startsAt <= new Date()) return { skipped: true, reason: "appointment-already-started" };
  const minutes = Math.max(0, Number(consultationConfig.reminderBeforeMinutes[appointmentType(booking)] ?? 5));
  const scheduledFor = new Date(Math.max(Date.now(), startsAt.getTime() - minutes * 60000));
  if (booking.qstashReminderMessageId) await cancelConsultationReminder(booking.qstashReminderMessageId);
  const destination = callbackBaseUrl + "/api/booking/reminders/" + booking._id;
  const response = await fetch(qstashUrl() + "/v2/publish/" + destination, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.QSTASH_TOKEN,
      "Content-Type": "application/json",
      "Upstash-Method": "POST",
      "Upstash-Not-Before": String(Math.ceil(scheduledFor.getTime() / 1000)),
      "Upstash-Retries": "3",
      "Upstash-Redact-Fields": "body",
      "Upstash-Label": "consultation-reminder",
    },
    body: JSON.stringify({ bookingId: String(booking._id) }),
  });
  if (!response.ok) throw new Error("QStash reminder scheduling failed (" + response.status + ").");
  const data = await response.json();
  if (!data.messageId) throw new Error("QStash did not return a reminder message ID.");
  return { messageId: data.messageId, scheduledFor };
}

