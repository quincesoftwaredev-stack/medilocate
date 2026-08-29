import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";

import styles from "@/styles/Admin/NewAdmin.module.css";

export default function DashboardHeader({ periodLabel, onRefresh }) {
    return (
        <header className={styles.pageHeader}>
            <div>
                <div className={styles.titleRow}>
                    <span className={styles.titleIcon}>
                        <SpaceDashboardOutlinedIcon />
                    </span>

                    <div>
                        <span className={styles.eyebrow}>ADMIN OVERVIEW</span>
                        <h1>Dashboard</h1>
                    </div>
                </div>

                <p>
                    Monitor medicine orders, prescriptions, inventory and
                    healthcare operations from one place.
                </p>
            </div>

            <div className={styles.headerActions}>
                <span className={styles.periodBadge}>{periodLabel}</span>

                <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={onRefresh}
                >
                    <RefreshRoundedIcon />
                    Refresh
                </button>
            </div>
        </header>
    );
}
