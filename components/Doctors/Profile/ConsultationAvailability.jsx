import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ConsultationModes from "./ConsultationModes";
import WeeklySchedule from "./WeeklySchedule";
import PracticeDetails from "./PracticeDetails";
import styles from "./ConsultationAvailability.module.css";

export default function ConsultationAvailability({ doctor }) {
  const hasData = doctor.chambers?.length || doctor.weeklyAvailability?.some((day) => day.slots?.length) || doctor.unavailablePeriods?.length || Object.values(doctor.consultationModes || {}).some((mode) => mode?.enabled);
  if (!hasData) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.icon}><EventAvailableOutlinedIcon /></div>
        <div><span>APPOINTMENTS</span><h2>Consultation & availability</h2></div>
      </header>
      <ConsultationModes modes={doctor.consultationModes} availability={doctor.weeklyAvailability} fallbackFee={doctor.consultationFee} />
      <div className={styles.content}>
        <div className={styles.schedule}>
          <h3>Weekly schedule</h3>
          <WeeklySchedule availability={doctor.weeklyAvailability} />
        </div>
        <PracticeDetails chambers={doctor.chambers} unavailablePeriods={doctor.unavailablePeriods} bookingSettings={doctor.bookingSettings} />
      </div>
    </section>
  );
}
