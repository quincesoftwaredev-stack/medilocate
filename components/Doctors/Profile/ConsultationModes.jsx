import styles from "./ConsultationAvailability.module.css";
import { getDoctorModeConfig } from "@/utility/booking";

const MODE_CONFIG = [
  ["chamber", "Chamber"],
  ["online", "Online"],
  ["home", "Home visit"],
];

export default function ConsultationModes({ modes = {}, availability = [], fallbackFee = 0, selectedMode, onSelect }) {
  const scheduled = new Set(
    availability
      .filter((day) => day.isAvailable !== false)
      .flatMap((day) => (day.slots || []).map((slot) => ["home", "home-visit"].includes(slot.consultationMode) ? "home" : slot.consultationMode))
  );
  const enabledModes = MODE_CONFIG
    .map(([key, label]) => ({ key, label, ...getDoctorModeConfig({ consultationModes: modes }, key) }))
    .filter((mode) => scheduled.has(mode.key));

  if (!enabledModes.length) return null;

  return (
    <div className={styles.modeList} role="tablist" aria-label="Consultation type">
      {enabledModes.map((mode) => (
        <button
          type="button"
          role="tab"
          aria-selected={selectedMode === mode.key}
          className={`${styles.modeItem} ${selectedMode === mode.key ? styles.activeMode : ""}`}
          key={mode.key}
          onClick={() => onSelect(mode.key)}
        >
          <span>{mode.label}</span>
          <strong>{"\u09F3"}{Number(mode.fee ?? fallbackFee ?? 0).toLocaleString("en-BD")}</strong>
        </button>
      ))}
    </div>
  );
}
