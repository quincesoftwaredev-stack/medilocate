import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { humanizeStatus } from "./dashboardData";
import styles from "@/styles/Admin/NewAdmin.module.css";

const pipelineStatuses = [
    "pending",
    "preparing",
    "ready",
    "assigned",
    "out_for_delivery",
    "delivered",
];

export default function OrderPipeline({ statuses = {}, sources = {} }) {
    const sourceTotal = (sources.cart || 0) + (sources.prescription || 0);
    const prescriptionShare = sourceTotal
        ? Math.round(((sources.prescription || 0) / sourceTotal) * 100)
        : 0;

    return (
        <section className={`${styles.panel} ${styles.pipelinePanel}`}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>ORDER FULFILMENT</span>
                    <h2>Order pipeline</h2>
                </div>
                <Link href="/admin/orders" className={styles.textLink}>
                    View orders <ArrowForwardRoundedIcon />
                </Link>
            </div>

            <div className={styles.pipeline}>
                {pipelineStatuses.map((status, index) => (
                    <div key={status} className={styles.pipelineStep}>
                        <span className={`${styles.pipelineDot} ${styles[`${status}Dot`]}`} />
                        <strong>{statuses[status] || 0}</strong>
                        <small>{humanizeStatus(status)}</small>
                        {index < pipelineStatuses.length - 1 && <i />}
                    </div>
                ))}
            </div>

            <div className={styles.orderFootnotes}>
                <div>
                    <span>Cancelled</span>
                    <strong>{statuses.cancelled || 0}</strong>
                </div>
                <div>
                    <span>Failed</span>
                    <strong>{statuses.failed || 0}</strong>
                </div>
                <div className={styles.sourceSummary}>
                    <span>Order source</span>
                    <strong>{sources.cart || 0} cart</strong>
                    <small>·</small>
                    <strong>{sources.prescription || 0} prescription</strong>
                    <em>{prescriptionShare}% from prescriptions</em>
                </div>
            </div>
        </section>
    );
}

