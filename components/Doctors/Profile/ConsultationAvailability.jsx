import { useEffect, useMemo, useState } from "react";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ConsultationModes from "./ConsultationModes";
import WeeklySchedule from "./WeeklySchedule";
import PracticeDetails from "./PracticeDetails";
import styles from "./ConsultationAvailability.module.css";

const canonicalMode = (value) => ["home", "home-visit"].includes(value) ? "home" : value;

export default function ConsultationAvailability({ doctor }) {
  const availableModes = useMemo(() => Array.from(new Set(
    (doctor.weeklyAvailability || [])
      .filter((day) => day.isAvailable !== false)
      .flatMap((day) => (day.slots || []).map((slot) => canonicalMode(slot.consultationMode)))
      .filter((mode) => ["chamber", "online", "home"].includes(mode))
  )), [doctor.weeklyAvailability]);
  const [selectedMode, setSelectedMode] = useState(availableModes[0] || "chamber");

  useEffect(() => {
    if (!availableModes.includes(selectedMode)) setSelectedMode(availableModes[0] || "chamber");
  }, [availableModes, selectedMode]);

  const hasData = doctor.chambers?.length || availableModes.length || doctor.unavailablePeriods?.length || Object.values(doctor.consultationModes || {}).some((mode) => mode?.enabled);
  if (!hasData) return null;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.icon}><EventAvailableOutlinedIcon /></div>
        <div><span>APPOINTMENTS</span><h2>Consultation & availability</h2></div>
      </header>
      <ConsultationModes
        modes={doctor.consultationModes}
        availability={doctor.weeklyAvailability}
        fallbackFee={doctor.consultationFee}
        selectedMode={selectedMode}
        onSelect={setSelectedMode}
      />
      <div className={styles.content}>
        <div className={styles.schedule}>
          <h3>Weekly schedule - {selectedMode === "home" ? "Home visit" : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}</h3>
          <WeeklySchedule availability={doctor.weeklyAvailability} mode={selectedMode} />
        </div>
        <PracticeDetails chambers={doctor.chambers} unavailablePeriods={doctor.unavailablePeriods} bookingSettings={doctor.bookingSettings} />
      </div>
    </section>
  );
}
