import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { formatDateTime, humanizeStatus } from "./dashboardData";
import styles from "@/styles/Admin/NewAdmin.module.css";

const statusItems = [
    ["pending", "Pending review"],
    ["reviewing", "Reviewing"],
    ["medicines_identified", "Medicines identified"],
    ["order_created", "Order created"],
    ["completed", "Completed"],
    ["rejected", "Rejected"],
];

export default function PrescriptionOverview({ data = {} }) {
    const statuses = data.statuses || {};
    const recent = data.recent || [];

    return (
        <section className={`${styles.panel} ${styles.prescriptionPanel}`}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>PRESCRIPTIONS</span>
                    <h2>Prescription operations</h2>
                </div>
                <Link href="/admin/prescriptions" className={styles.textLink}>
                    Review all <ArrowForwardRoundedIcon />
                </Link>
            </div>

            <div className={styles.prescriptionStats}>
                {statusItems.map(([status, label]) => (
                    <div key={status}>
                        <strong>{statuses[status] || 0}</strong>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className={styles.miniList}>
                <div className={styles.miniListHeader}>
                    <strong>Waiting for action</strong>
                    <span>Oldest first</span>
                </div>

                {recent.length ? recent.map((prescription) => (
                    <Link
                        key={prescription._id}
                        href={`/admin/prescriptions/${prescription._id}`}
                        className={styles.miniListItem}
                    >
                        <span className={styles.miniIcon}><DescriptionOutlinedIcon /></span>
                        <span>
                            <strong>{prescription.requestCode}</strong>
                            <small>{prescription.patient?.name || "Unknown patient"} · {formatDateTime(prescription.createdAt)}</small>
                        </span>
                        <em className={`${styles.statusBadge} ${styles[`${prescription.status}Badge`]}`}>
                            {humanizeStatus(prescription.status)}
                        </em>
                    </Link>
                )) : (
                    <div className={styles.emptyMiniList}>No prescriptions are waiting for review.</div>
                )}
            </div>
        </section>
    );
}

