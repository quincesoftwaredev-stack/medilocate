import { useEffect, useState } from "react";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import styles from "@/styles/Admin/NewAdmin.module.css";

const periodOptions = [
    { value: "today", label: "Today" },
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
];

export default function DashboardFilters({ query, onChange }) {
    const [showCustom, setShowCustom] = useState(
        Boolean(query.startDate && query.endDate)
    );
    const [startDate, setStartDate] = useState(query.startDate || "");
    const [endDate, setEndDate] = useState(query.endDate || "");

    useEffect(() => {
        setStartDate(query.startDate || "");
        setEndDate(query.endDate || "");
    }, [query.startDate, query.endDate]);

    const applyCustomRange = () => {
        if (!startDate || !endDate || startDate > endDate) return;
        onChange({ period: "custom", startDate, endDate });
    };

    return (
        <section className={styles.filterBar} aria-label="Dashboard filters">
            <div className={styles.periodOptions}>
                {periodOptions.map((option) => (
                    <button
                        key={option.value || "all"}
                        type="button"
                        className={`${styles.periodButton} ${
                            !query.startDate &&
                            (query.period || "last_7_days") === option.value
                                ? styles.activePeriod
                                : ""
                        }`}
                        onClick={() => {
                            setShowCustom(false);
                            onChange({ period: option.value });
                        }}
                    >
                        {option.label}
                    </button>
                ))}

                <button
                    type="button"
                    className={`${styles.periodButton} ${styles.customButton} ${
                        query.startDate ? styles.activePeriod : ""
                    }`}
                    onClick={() => setShowCustom((current) => !current)}
                >
                    <CalendarTodayOutlinedIcon />
                    Custom range
                </button>
            </div>

            {showCustom && (
                <div className={styles.customRange}>
                    <label>
                        <span>From</span>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || undefined}
                            onChange={(event) => setStartDate(event.target.value)}
                        />
                    </label>

                    <label>
                        <span>To</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate || undefined}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(event) => setEndDate(event.target.value)}
                        />
                    </label>

                    <button
                        type="button"
                        className={styles.applyButton}
                        disabled={!startDate || !endDate || startDate > endDate}
                        onClick={applyCustomRange}
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        className={styles.closeFilterButton}
                        aria-label="Close custom date filter"
                        onClick={() => setShowCustom(false)}
                    >
                        <CloseRoundedIcon />
                    </button>
                </div>
            )}
        </section>
    );
}
