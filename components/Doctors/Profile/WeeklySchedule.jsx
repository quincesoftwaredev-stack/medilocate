import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import styles from "./ConsultationAvailability.module.css";
import { getWindowPlan } from "@/utility/booking";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MODE_LABELS = { chamber: "Chamber", online: "Online", "home-visit": "Home visit" };

export default function WeeklySchedule({ availability = [] }) {
  const days = availability.filter((day) => day.isAvailable && day.slots?.length);
  if (!days.length) return <p className={styles.empty}>Weekly schedule has not been added.</p>;

  return (
    <div className={styles.scheduleList}>
      {days.map((day) => (
        <article className={styles.scheduleDay} key={day.dayOfWeek}>
          <strong className={styles.dayName}>{DAYS[day.dayOfWeek] || "Day"}</strong>
          <div className={styles.slotList}>
            {day.slots.map((slot, index) => {
              const plan = getWindowPlan(slot);
              const countLabel = slot.consultationMode === "chamber" ? "serials" : "appointments";
              return (
              <div className={styles.slot} key={slot._id || `${day.dayOfWeek}-${index}`}>
                <ScheduleOutlinedIcon />
                <span>{slot.startTime}–{slot.endTime}</span>
                <small>{MODE_LABELS[slot.consultationMode] || "Chamber"}</small>
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
