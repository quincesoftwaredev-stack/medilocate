import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import styles from "./ConsultationAvailability.module.css";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
  : "";

export default function PracticeDetails({ chambers = [], unavailablePeriods = [], bookingSettings }) {
  const activeChambers = chambers.filter((chamber) => chamber.isActive !== false);
  return (
    <aside className={styles.details}>
      {activeChambers.length > 0 && (
        <div className={styles.detailGroup}>
          <h3><BusinessOutlinedIcon /> Chambers</h3>
          {activeChambers.map((chamber) => (
            <div className={styles.detailItem} key={chamber._id || chamber.name}>
              <strong>{chamber.name}</strong>
              <span>{[chamber.address, chamber.city].filter(Boolean).join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      {unavailablePeriods.length > 0 && (
        <div className={styles.detailGroup}>
          <h3><CalendarTodayOutlinedIcon /> Upcoming leave</h3>
          {unavailablePeriods.map((period, index) => (
            <div className={styles.detailItem} key={period._id || index}>
              <strong>{formatDate(period.startDate)}{period.endDate ? ` – ${formatDate(period.endDate)}` : ""}</strong>
              {period.reason && <span>{period.reason}</span>}
            </div>
          ))}
        </div>
      )}

      {bookingSettings && (
        <div className={styles.bookingRule}>
          Book up to <strong>{bookingSettings.advanceBookingDays || 30} days</strong> ahead · Maximum <strong>{bookingSettings.maxPatientsPerDay || 30} patients/day</strong>
        </div>
      )}
    </aside>
  );
}
