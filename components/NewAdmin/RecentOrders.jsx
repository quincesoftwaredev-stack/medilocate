import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import { formatCurrency, formatDateTime, humanizeStatus } from "./dashboardData";
import styles from "@/styles/Admin/NewAdmin.module.css";

export default function RecentOrders({ orders = [] }) {
    return (
        <section className={styles.tablePanel}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>LATEST ACTIVITY</span>
                    <h2>Recent orders</h2>
                </div>
                <Link href="/admin/orders" className={styles.textLink}>
                    View all orders <ArrowForwardRoundedIcon />
                </Link>
            </div>

            {orders.length ? (
                <div className={styles.tableWrap}>
                    <table>
                        <thead>
                            <tr>
                                <th>Tracking</th>
                                <th>Customer</th>
                                <th>Source</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td><strong>{order.trackingNumber}</strong></td>
                                    <td>
                                        <span className={styles.customerCell}>
                                            <strong>{order.delivery?.name || "N/A"}</strong>
                                            <small>{order.delivery?.phone || ""}</small>
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.sourceBadge} ${order.prescription ? styles.prescriptionSource : styles.cartSource}`}>
                                            {order.prescription ? "Prescription" : "Cart"}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(order.total)}</td>
                                    <td><span className={`${styles.statusBadge} ${styles[`${order.paymentStatus}Badge`]}`}>{humanizeStatus(order.paymentStatus)}</span></td>
                                    <td><span className={`${styles.statusBadge} ${styles[`${order.status}Badge`]}`}>{humanizeStatus(order.status)}</span></td>
                                    <td>{formatDateTime(order.createdAt)}</td>
                                    <td>
                                        <Link href={`/admin/orders/${order._id}`} className={styles.iconLink} aria-label={`View order ${order.trackingNumber}`}>
                                            <VisibilityOutlinedIcon />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.emptyTable}>No orders have been created yet.</div>
            )}
        </section>
    );
}

