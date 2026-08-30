import styles from "./ConsultationAvailability.module.css";

const MODE_CONFIG = [
  ["chamber", "Chamber"],
  ["online", "Online"],
  ["homeVisit", "Home visit"],
];

export default function ConsultationModes({ modes = {} }) {
  const enabledModes = MODE_CONFIG
    .map(([key, label]) => ({ key, label, ...modes[key] }))
    .filter((mode) => mode.enabled);

  if (!enabledModes.length) return null;

  return (
    <div className={styles.modeList}>
      {enabledModes.map((mode) => (
        <div className={styles.modeItem} key={mode.key}>
          <span>{mode.label}</span>
          <strong>৳{Number(mode.fee || 0).toLocaleString("en-BD")}</strong>
        </div>
      ))}
    </div>
  );
}
