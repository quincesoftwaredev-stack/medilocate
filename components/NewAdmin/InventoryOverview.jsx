import Link from "next/link";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { formatCurrency } from "./dashboardData";
import styles from "@/styles/Admin/NewAdmin.module.css";

export default function InventoryOverview({ inventory = {} }) {
    const alerts = inventory.alerts || [];
    const bestSelling = inventory.bestSelling || [];

    return (
        <section className={`${styles.panel} ${styles.inventoryPanel}`}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>INVENTORY</span>
                    <h2>Medicine health</h2>
                </div>
                <div className={styles.inlineActions}>
                    <Link href="/admin/medicines/new" className={styles.secondaryButton}><AddRoundedIcon /> Add medicine</Link>
                    <Link href="/admin/medicines" className={styles.textLink}>View inventory <ArrowForwardRoundedIcon /></Link>
                </div>
            </div>

            <div className={styles.inventoryStats}>
                <div><strong>{inventory.active || 0}</strong><span>Active medicines</span></div>
                <div><strong>{inventory.prescriptionRequired || 0}</strong><span>Prescription required</span></div>
                <div className={styles.warningMetric}><strong>{inventory.lowStock || 0}</strong><span>Low stock</span></div>
                <div className={styles.dangerMetric}><strong>{inventory.outOfStock || 0}</strong><span>Out of stock</span></div>
            </div>

            <div className={styles.inventoryColumns}>
                <div>
                    <div className={styles.subsectionTitle}>
                        <span><WarningAmberRoundedIcon /> Stock alerts</span>
                        <small>Reorder level</small>
                    </div>
                    <div className={styles.stockList}>
                        {alerts.length ? alerts.map((medicine) => (
                            <Link key={medicine._id} href={`/admin/medicines/${medicine._id}`} className={styles.stockItem}>
                                <span className={styles.stockIcon}><Inventory2OutlinedIcon /></span>
                                <span>
                                    <strong>{medicine.name}</strong>
                                    <small>{medicine.genericName} {medicine.strength}</small>
                                </span>
                                <em className={medicine.stock <= 0 ? styles.outStock : styles.lowStock}>
                                    {medicine.stock <= 0 ? "Out" : `${medicine.stock} left`}
                                </em>
                            </Link>
                        )) : <div className={styles.emptyMiniList}>Inventory levels look healthy.</div>}
                    </div>
                </div>

                <div>
                    <div className={styles.subsectionTitle}>
                        <span>Best sellers</span>
                        <small>Delivered orders</small>
                    </div>
                    <div className={styles.sellerList}>
                        {bestSelling.length ? bestSelling.map((medicine, index) => (
                            <div key={String(medicine._id)} className={styles.sellerItem}>
                                <span className={styles.rank}>{index + 1}</span>
                                <span>
                                    <strong>{medicine.name}</strong>
                                    <small>{medicine.strength || "Medicine"}</small>
                                </span>
                                <span className={styles.sellerValue}>
                                    <strong>{medicine.quantity} sold</strong>
                                    <small>{formatCurrency(medicine.revenue)}</small>
                                </span>
                            </div>
                        )) : <div className={styles.emptyMiniList}>No delivered medicine sales in this period.</div>}
                    </div>
                </div>
            </div>
        </section>
    );
}

