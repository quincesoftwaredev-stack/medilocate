import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useState } from "react";
import { getWindowPlan } from "@/utility/booking";
import styles from "./DoctorAvailabilityEditor.module.css";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MODES = [
  { key: "chamber", slotValue: "chamber", label: "Chamber", description: "In-person consultation", Icon: BusinessOutlinedIcon },
  { key: "online", slotValue: "online", label: "Online", description: "Video consultation", Icon: VideoCallOutlinedIcon },
  { key: "homeVisit", slotValue: "home-visit", label: "Home visit", description: "Visit the patient at home", Icon: HomeOutlinedIcon },
];
const emptyChamber = () => ({
  name: "",
  address: "",
  city: "",
  phone: "",
  isActive: true,
});
const emptyLeave = () => ({
  startDate: "",
  endDate: "",
  reason: "",
  allDay: true,
});
const defaultDay = (dayOfWeek) => ({
  dayOfWeek,
  isAvailable: false,
  slots: [
    {
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
      calculationMethod: "duration",
      maxPatientsPerWindow: 16,
      bufferMinutes: 0,
      maxPatientsPerSlot: 1,
      consultationMode: "chamber",
    },
  ],
});

export function createAvailabilityForm(doctor = {}) {
  const savedDays = Array.isArray(doctor.weeklyAvailability)
    ? doctor.weeklyAvailability.map((day) => ({
        ...day,
        slots: (day.slots || []).map((slot) => ({
          ...slot,
          calculationMethod: slot.calculationMethod || "duration",
          maxPatientsPerWindow: Number(slot.maxPatientsPerWindow || slot.maxPatientsPerSlot || 1),
          bufferMinutes: Number(slot.bufferMinutes || 0),
        })),
      }))
    : [];
  return {
    chambers: Array.isArray(doctor.chambers) ? doctor.chambers : [],
    weeklyAvailability: DAYS.map(
      (_, index) =>
        savedDays.find((day) => Number(day.dayOfWeek) === index) ||
        defaultDay(index),
    ),
    unavailablePeriods: Array.isArray(doctor.unavailablePeriods)
      ? doctor.unavailablePeriods.map((period) => ({
          ...period,
          startDate: period.startDate
            ? String(period.startDate).slice(0, 10)
            : "",
          endDate: period.endDate ? String(period.endDate).slice(0, 10) : "",
        }))
      : [],
    consultationModes: doctor.consultationModes || {
      chamber: { enabled: true, fee: doctor.consultationFee || 0 },
      online: { enabled: false, fee: 0 },
      homeVisit: { enabled: false, fee: 0 },
    },
    bookingSettings: doctor.bookingSettings || {
      advanceBookingDays: 30,
      minimumNoticeMinutes: 60,
      cancellationNoticeMinutes: 120,
      maxPatientsPerDay: 30,
      autoConfirmBookings: false,
    },
  };
}

export default function DoctorAvailabilityEditor({ value, onChange }) {
  const [activeMode, setActiveMode] = useState("chamber");
  const selectedMode =
    MODES.find((mode) => mode.key === activeMode) || MODES[0];
  const update = (key, nextValue) => onChange({ ...value, [key]: nextValue });
  const updateChamber = (index, key, nextValue) => {
    const chambers = [...value.chambers];
    chambers[index] = { ...chambers[index], [key]: nextValue };
    update("chambers", chambers);
  };
  const updateDay = (index, changes) => {
    const days = [...value.weeklyAvailability];
    days[index] = { ...days[index], ...changes };
    update("weeklyAvailability", days);
  };
  const updateSlot = (dayIndex, slotIndex, key, nextValue) => {
    const day = value.weeklyAvailability[dayIndex];
    const slots = [...(day.slots || [])];
    const changes = typeof key === "object" ? key : { [key]: nextValue };
    slots[slotIndex] = { ...slots[slotIndex], ...changes };
    updateDay(dayIndex, { slots });
  };
  const addSlot = (dayIndex) => {
    const day = value.weeklyAvailability[dayIndex];
    updateDay(dayIndex, {
      isAvailable: true,
      slots: [
        ...(day.slots || []),
        {
          ...defaultDay(dayIndex).slots[0],
          consultationMode: selectedMode.slotValue,
        },
      ],
    });
  };
  const removeSlot = (dayIndex, slotIndex) => {
    const day = value.weeklyAvailability[dayIndex];
    const slots = (day.slots || []).filter((_, index) => index !== slotIndex);
    updateDay(dayIndex, { slots, isAvailable: slots.length > 0 });
  };
  const updateLeave = (index, key, nextValue) => {
    const periods = [...value.unavailablePeriods];
    periods[index] = { ...periods[index], [key]: nextValue };
    update("unavailablePeriods", periods);
  };

  return (
    <section className={styles.editor}>
      <header className={styles.header}>
        <div className={styles.icon}>
          <EventAvailableRoundedIcon />
        </div>
        <div>
          <h2>Practice & availability</h2>
          <p>Manage chambers, weekly slots, leave dates and booking rules.</p>
        </div>
      </header>

      <div className={styles.block}>
        <div className={styles.blockTitle}>
          <div>
            <h3>Chambers</h3>
            <p>Add the places where patients can visit.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              update("chambers", [...value.chambers, emptyChamber()])
            }
          >
            <AddRoundedIcon /> Add chamber
          </button>
        </div>
        {value.chambers.length === 0 && (
          <p className={styles.empty}>No chamber added yet.</p>
        )}
        <div className={styles.cardGrid}>
          {value.chambers.map((chamber, index) => (
            <article className={styles.card} key={chamber._id || index}>
              <button
                className={styles.remove}
                type="button"
                aria-label="Remove chamber"
                onClick={() =>
                  update(
                    "chambers",
                    value.chambers.filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  )
                }
              >
                <DeleteOutlineRoundedIcon />
              </button>
              <label>
                Chamber name
                <input
                  value={chamber.name || ""}
                  onChange={(event) =>
                    updateChamber(index, "name", event.target.value)
                  }
                  placeholder="Hospital or chamber name"
                />
              </label>
              <label>
                Address
                <input
                  value={chamber.address || ""}
                  onChange={(event) =>
                    updateChamber(index, "address", event.target.value)
                  }
                  placeholder="Full address"
                />
              </label>
              <div className={styles.twoColumns}>
                <label>
                  City
                  <input
                    value={chamber.city || ""}
                    onChange={(event) =>
                      updateChamber(index, "city", event.target.value)
                    }
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={chamber.phone || ""}
                    onChange={(event) =>
                      updateChamber(index, "phone", event.target.value)
                    }
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockTitle}>
          <div>
            <h3>Consultation modes</h3>
            <p>Choose available services and their fees.</p>
          </div>
        </div>
        <div className={styles.modeGrid}>
          {MODES.map(({ key, label, description, Icon }) => {
            const mode = value.consultationModes[key] || {
              enabled: false,
              fee: 0,
            };
            return (
              <article className={`${styles.mode} ${mode.enabled ? styles.modeEnabled : ""}`} key={key}>
                <div className={styles.modeHeader}>
                  <div className={styles.modeIdentity}>
                    <span className={styles.modeIcon}><Icon /></span>
                    <div>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </div>
                  </div>
                  <label className={styles.modeSwitch}>
                    <input
                      type="checkbox"
                      checked={Boolean(mode.enabled)}
                      onChange={(event) =>
                        update("consultationModes", {
                          ...value.consultationModes,
                          [key]: { ...mode, enabled: event.target.checked },
                        })
                      }
                    />
                    <span aria-hidden="true" />
                    <em>{mode.enabled ? "Enabled" : "Disabled"}</em>
                  </label>
                </div>
                <label className={styles.modeFee}>
                  <span>Consultation fee</span>
                  <div>
                    <strong>৳</strong>
                  <input
                    type="number"
                    min="0"
                    value={mode.fee ?? 0}
                    disabled={!mode.enabled}
                    onChange={(event) =>
                      update("consultationModes", {
                        ...value.consultationModes,
                        [key]: { ...mode, fee: Number(event.target.value) },
                      })
                    }
                  />
                  </div>
                </label>
              </article>
            );
          })}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockTitle}>
          <div>
            <h3>Weekly slots</h3>
            <p>Create separate schedules for each consultation mode.</p>
          </div>
        </div>
        <div className={styles.modeTabs}>
          {MODES.map((mode) => {
            const ModeIcon = mode.Icon;
            return (
            <button
              type="button"
              key={mode.key}
              disabled={!value.consultationModes[mode.key]?.enabled}
              className={activeMode === mode.key ? styles.modeTabActive : ""}
              onClick={() => setActiveMode(mode.key)}
            >
              <ModeIcon />
              {mode.label}
            </button>
            );
          })}
        </div>
        {!value.consultationModes[activeMode]?.enabled && (
          <p className={styles.empty}>
            Enable {selectedMode.label} above to add its weekly slots.
          </p>
        )}
        <div className={styles.days}>
          {value.weeklyAvailability.map((day, index) => {
            const indexedSlots = (day.slots || [])
              .map((slot, slotIndex) => ({ slot, slotIndex }))
              .filter(
                ({ slot }) => slot.consultationMode === selectedMode.slotValue,
              );
            return (
              <article
                className={`${styles.day} ${indexedSlots.length ? styles.dayActive : ""}`}
                key={day.dayOfWeek}
              >
                <div className={styles.dayHeader}>
                  <div>
                    <strong>{DAYS[day.dayOfWeek]}</strong>
                    <span>{indexedSlots.length ? `${indexedSlots.length} ${indexedSlots.length === 1 ? "slot" : "slots"}` : "Unavailable"}</span>
                  </div>
                  <div className={styles.dayActions}>
                    {indexedSlots.length > 0 && (
                      <button
                        className={styles.removeDaySlot}
                        type="button"
                        aria-label={`Remove latest ${DAYS[day.dayOfWeek]} slot`}
                        title="Remove latest slot"
                        onClick={() => removeSlot(index, indexedSlots[indexedSlots.length - 1].slotIndex)}
                      >
                        <DeleteOutlineRoundedIcon />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!value.consultationModes[activeMode]?.enabled}
                      onClick={() => addSlot(index)}
                    >
                      <AddRoundedIcon /> Add slot
                    </button>
                  </div>
                </div>
                {indexedSlots.length === 0 && (
                  <span className={styles.noSlot}>
                    No {selectedMode.label.toLowerCase()} slot
                  </span>
                )}
                {indexedSlots.map(({ slot, slotIndex }) => (
                  <div
                    className={styles.slotFields}
                    key={slot._id || slotIndex}
                  >
                    <label>
                      From
                      <input
                        type="time"
                        value={slot.startTime || ""}
                        onChange={(event) =>
                          updateSlot(
                            index,
                            slotIndex,
                            "startTime",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label>
                      To
                      <input
                        type="time"
                        value={slot.endTime || ""}
                        onChange={(event) =>
                          updateSlot(
                            index,
                            slotIndex,
                            "endTime",
                            event.target.value,
                          )
                        }
                      />
                    </label>
                    <label>
                      Calculate by
                      <select
                        value={slot.calculationMethod || "duration"}
                        onChange={(event) => updateSlot(index, slotIndex, {
                          calculationMethod: event.target.value,
                          maxPatientsPerSlot: 1,
                        })}
                      >
                        <option value="duration">Time per patient</option>
                        <option value="capacity">Patient capacity</option>
                      </select>
                    </label>
                    {slot.calculationMethod === "capacity" ? (
                      <label>
                        Maximum patients
                        <input
                          type="number"
                          min="1"
                          value={slot.maxPatientsPerWindow || 1}
                          onChange={(event) => updateSlot(index, slotIndex, "maxPatientsPerWindow", Number(event.target.value))}
                        />
                      </label>
                    ) : (
                      <label>
                        Minutes per patient
                        <input
                          type="number"
                          min="5"
                          max="240"
                          value={slot.slotDurationMinutes || 30}
                          onChange={(event) => updateSlot(index, slotIndex, "slotDurationMinutes", Number(event.target.value))}
                        />
                      </label>
                    )}
                    <label>
                      Break between patients
                      <select
                        value={slot.bufferMinutes || 0}
                        onChange={(event) => updateSlot(index, slotIndex, "bufferMinutes", Number(event.target.value))}
                      >
                        {[0, 5, 10, 15, 20, 30].map((minutes) => (
                          <option key={minutes} value={minutes}>{minutes ? `${minutes} minutes` : "No break"}</option>
                        ))}
                      </select>
                    </label>
                    {(() => {
                      const plan = getWindowPlan(slot);
                      return (
                        <p className={`${styles.slotSummary} ${!plan.valid ? styles.slotSummaryError : ""}`}>
                          {!plan.valid
                            ? plan.error
                            : slot.calculationMethod === "capacity"
                              ? `${plan.capacity} patients · about ${plan.durationMinutes} minutes each${plan.bufferMinutes ? ` · ${plan.bufferMinutes}-minute breaks` : ""}`
                              : `${plan.capacity} ${activeMode === "chamber" ? "serials" : "appointment times"} · ${plan.durationMinutes} minutes each${plan.bufferMinutes ? ` · ${plan.bufferMinutes}-minute breaks` : ""}`}
                        </p>
                      );
                    })()}
                  </div>
                ))}
              </article>
            );
          })}
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockTitle}>
          <div className={styles.subsectionHeading}>
            <span><EventBusyOutlinedIcon /></span>
            <div>
            <h3>Leave & unavailable dates</h3>
            <p>Block holidays or planned absences.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              update("unavailablePeriods", [
                ...value.unavailablePeriods,
                emptyLeave(),
              ])
            }
          >
            <AddRoundedIcon /> Add leave
          </button>
        </div>
        {value.unavailablePeriods.length === 0 && (
          <p className={styles.emptyState}>No unavailable dates added. Patients can book according to your weekly schedule.</p>
        )}
        {value.unavailablePeriods.map((period, index) => (
          <article className={styles.leave} key={period._id || index}>
            <span className={styles.leaveIndex}>{index + 1}</span>
            <label>
              From
              <input
                type="date"
                value={period.startDate || ""}
                onChange={(event) =>
                  updateLeave(index, "startDate", event.target.value)
                }
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={period.endDate || ""}
                onChange={(event) =>
                  updateLeave(index, "endDate", event.target.value)
                }
              />
            </label>
            <label>
              Reason
              <input
                value={period.reason || ""}
                onChange={(event) =>
                  updateLeave(index, "reason", event.target.value)
                }
                placeholder="Optional reason"
              />
            </label>
            <button
              className={styles.removeInline}
              type="button"
              aria-label={`Remove leave period ${index + 1}`}
              title="Remove leave"
              onClick={() =>
                update(
                  "unavailablePeriods",
                  value.unavailablePeriods.filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                )
              }
            >
              <DeleteOutlineRoundedIcon />
            </button>
          </article>
        ))}
      </div>

      <div className={styles.block}>
        <div className={styles.blockTitle}>
          <div className={styles.subsectionHeading}>
            <span><TuneOutlinedIcon /></span>
            <div>
            <h3>Booking rules</h3>
            <p>Control how far ahead patients can book.</p>
            </div>
          </div>
        </div>
        <div className={styles.ruleGrid}>
          {[
            ["advanceBookingDays", "Advance booking", "How early patients can book", "days"],
            ["minimumNoticeMinutes", "Minimum notice", "Required time before a visit", "min"],
            ["cancellationNoticeMinutes", "Cancellation notice", "Required time to cancel", "min"],
            ["maxPatientsPerDay", "Daily patient limit", "Maximum confirmed bookings", "patients"],
          ].map(([key, label, hint, unit]) => (
            <label key={key}>
              <strong>{label}</strong>
              <small>{hint}</small>
              <div className={styles.ruleInput}>
                <input
                  type="number"
                  min="0"
                  value={value.bookingSettings[key] ?? 0}
                  onChange={(event) =>
                    update("bookingSettings", {
                      ...value.bookingSettings,
                      [key]: Number(event.target.value),
                    })
                  }
                />
                <span>{unit}</span>
              </div>
            </label>
          ))}
        </div>
        <label className={`${styles.modeSwitch} ${styles.autoConfirm}`}>
          <input
            type="checkbox"
            checked={Boolean(value.bookingSettings.autoConfirmBookings)}
            onChange={(event) =>
              update("bookingSettings", {
                ...value.bookingSettings,
                autoConfirmBookings: event.target.checked,
              })
            }
          />
          <span aria-hidden="true" />
          <div>
            <strong>Automatically confirm new bookings</strong>
            <small>Bookings will not require manual approval.</small>
          </div>
        </label>
      </div>
    </section>
  );
}
