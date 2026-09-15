import BASE_URL from "@/config";
import Message from "@/services/message-service";
import { getConsultationTime, normalizeBangladeshPhone } from "@/utility/booking";

const typeOf = (booking) => booking.consultationType || (booking.consultationMode === "home-visit" ? "home" : booking.consultationMode);
const labelOf = (type) => type === "online" ? "online consultation" : type === "chamber" ? "chamber appointment" : "home consultation";
const dateOf = (booking) => new Intl.DateTimeFormat("en-BD", {
  timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric",
}).format(getConsultationTime(booking));
const timeOf = (booking, field) => {
  const [hours, minutes] = String(booking[field] || "").split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

export async function sendPaymentStatusSms(booking, status, sender = new Message()) {
  const number = normalizeBangladeshPhone(booking.patientPhone);
  if (!number) throw new Error("Patient phone is unavailable.");
  const type = typeOf(booking);
  const schedule = `${dateOf(booking)}, ${timeOf(booking, "startTime")} to ${timeOf(booking, "endTime")}`;
  const link = type === "online" ? ` Join: ${BASE_URL}/consultation/${booking._id}` : "";
  const message = status === "submitted"
    ? `MediLocate:)����� ${labelOf(type)}-�� payment)��� ��Ǜ�d Date & Time: ${schedule}d${link})���� payment verify ���)������)��ϕ�� SMS-� �����d`
    : `MediLocate:)����� payment verified ��Ǜ�d ${labelOf(type)} Date & Time: ${schedule}d${link}`;
  return sender.sendMessage({ number, message });
}
