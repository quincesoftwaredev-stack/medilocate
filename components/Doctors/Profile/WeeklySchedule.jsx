import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import styles from "./ConsultationAvailability.module.css";

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
            {day.slots.map((slot, index) => (
              <div className={styles.slot} key={slot._id || `${day.dayOfWeek}-${index}`}>
                <ScheduleOutlinedIcon />
                <span>{slot.startTime}–{slot.endTime}</span>
                <small>{MODE_LABELS[slot.consultationMode] || "Chamber"}</small>
                <small>{slot.slotDurationMinutes || 30} min</small>
                <small>{slot.maxPatientsPerSlot || 1} seat{Number(slot.maxPatientsPerSlot || 1) === 1 ? "" : "s"}</small>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
