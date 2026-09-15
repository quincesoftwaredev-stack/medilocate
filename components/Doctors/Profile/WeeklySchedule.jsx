import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import styles from "./ConsultationAvailability.module.css";
import { getWindowPlan } from "@/utility/booking";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const canonicalMode = (value) => ["home", "home-visit"].includes(value) ? "home" : value;
const localTime = (value) => {
  const [hours, minutes] = String(value || "").split(":").map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return value;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

export default function WeeklySchedule({ availability = [], mode }) {
  const days = availability
    .filter((day) => day.isAvailable && day.slots?.some((slot) => canonicalMode(slot.consultationMode) === mode))
    .map((day) => ({ ...day, slots: day.slots.filter((slot) => canonicalMode(slot.consultationMode) === mode) }));
  if (!days.length) return <p className={styles.empty}>No schedule has been added for this consultation type.</p>;

  return (
    <div className={styles.scheduleList}>
      {days.map((day) => (
        <article className={styles.scheduleDay} key={day.dayOfWeek}>
          <strong className={styles.dayName}>{DAYS[day.dayOfWeek] || "Day"}</strong>
          <div className={styles.slotList}>
            {day.slots.map((slot, index) => {
              const plan = getWindowPlan(slot);
              const countLabel = canonicalMode(slot.consultationMode) === "chamber" ? "serials" : "appointments";
              return (
                <div className={styles.slot} key={slot._id || `${day.dayOfWeek}-${index}`}>
                  <ScheduleOutlinedIcon />
                  <span>{localTime(slot.startTime)}{localTime(slot.endTime)}</span>
                  {plan.valid && <>
                    <small>{plan.capacity} {countLabel}</small>
                    <small>~{plan.durationMinutes} min each</small>
                    {plan.bufferMinutes > 0 && <small>{plan.bufferMinutes} min break</small>}
                  </>}
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
