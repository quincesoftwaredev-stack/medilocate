import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";

import styles from "@/styles/Admin/NewAdmin.module.css";

export default function ActionRequired({ data = {} }) {
    const items = [
        {
            label: "Prescriptions awaiting review",
            count: data.pendingPrescriptions || 0,
            helper: "Review patient uploads and identify medicines",
            href: "/admin/prescriptions?status=pending",
            icon: DescriptionOutlinedIcon,
            tone: "blue",
        },
        {
            label: "Orders awaiting preparation",
            count: data.ordersAwaitingPreparation || 0,
            helper: "Confirm stock and start preparing medicines",
            href: "/admin/orders?status=pending",
            icon: PendingActionsOutlinedIcon,
            tone: "amber",
        },
        {
            label: "Low or out-of-stock medicines",
            count: data.lowStockMedicines || 0,
            helper: "Replenish inventory before orders are delayed",
            href: "/admin/medicines",
            icon: Inventory2OutlinedIcon,
            tone: "red",
        },
        {
            label: "Failed orders",
            count: data.failedOrders || 0,
            helper: "Inspect failures and contact affected customers",
            href: "/admin/orders?status=failed",
            icon: ErrorOutlineRoundedIcon,
            tone: "red",
        },
        {
            label: "Doctors awaiting verification",
            count: data.pendingDoctorVerification || 0,
            helper: "Review credentials before activating profiles",
            href: "/admin/doctors?verification=pending",
            icon: MedicalServicesOutlinedIcon,
            tone: "teal",
        },
    ];

    return (
        <section className={`${styles.panel} ${styles.actionPanel}`}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>ACTION REQUIRED</span>
                    <h2>Operational queue</h2>
                </div>
                <p>Current items that need attention, regardless of date filter.</p>
            </div>

            <div className={styles.actionList}>
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.label} href={item.href} className={styles.actionItem}>
                            <span className={`${styles.actionIcon} ${styles[`${item.tone}Action`]}`}>
                                <Icon />
                            </span>
                            <span className={styles.actionCopy}>
                                <strong>{item.label}</strong>
                                <small>{item.helper}</small>
                            </span>
                            <span className={styles.actionCount}>{item.count}</span>
                            <ArrowForwardRoundedIcon className={styles.actionArrow} />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

