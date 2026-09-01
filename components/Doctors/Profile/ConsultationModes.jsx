import styles from "./ConsultationAvailability.module.css";

const MODE_CONFIG = [
  ["chamber", "Chamber"],
  ["online", "Online"],
  ["homeVisit", "Home visit"],
];

export default function ConsultationModes({ modes = {}, availability = [], fallbackFee = 0 }) {
  const scheduled = new Set(
    availability
      .filter((day) => day.isAvailable !== false)
      .flatMap((day) => (day.slots || []).map((slot) => slot.consultationMode === "home-visit" ? "homeVisit" : slot.consultationMode))
  );
  const enabledModes = MODE_CONFIG
    .map(([key, label]) => ({ key, label, ...modes[key] }))
    .filter((mode) => scheduled.has(mode.key));

  if (!enabledModes.length) return null;

  return (
    <div className={styles.modeList}>
      {enabledModes.map((mode) => (
        <div className={styles.modeItem} key={mode.key}>
          <span>{mode.label}</span>
          <strong>৳{Number(mode.fee ?? fallbackFee ?? 0).toLocaleString("en-BD")}</strong>
        </div>
      ))}
    </div>
  );
}
