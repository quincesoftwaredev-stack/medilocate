import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import { formatCurrency } from "./dashboardData";
import styles from "@/styles/Admin/NewAdmin.module.css";

export default function DashboardStats({ kpis }) {
    const cards = [
        {
            label: "Delivered revenue",
            value: formatCurrency(kpis.deliveredRevenue),
            helper: `${kpis.deliveredOrders || 0} delivered orders`,
            icon: PaymentsOutlinedIcon,
            tone: "purple",
            primary: true,
        },
        {
            label: "Total orders",
            value: kpis.totalOrders || 0,
            helper: "Within selected period",
            icon: ShoppingBagOutlinedIcon,
            tone: "teal",
        },
        {
            label: "Pending orders",
            value: kpis.pendingOrders || 0,
            helper: "Awaiting preparation",
            icon: PendingActionsOutlinedIcon,
            tone: "amber",
        },
        {
            label: "Pending prescriptions",
            value: kpis.pendingPrescriptions || 0,
            helper: "Waiting for review",
            icon: DescriptionOutlinedIcon,
            tone: "blue",
        },
        {
            label: "Low-stock medicines",
            value: kpis.lowStockMedicines || 0,
            helper: "Includes out of stock",
            icon: Inventory2OutlinedIcon,
            tone: "red",
        },
        {
            label: "Today’s appointments",
            value: kpis.todayAppointments || 0,
            helper: "Doctor consultations",
            icon: CalendarMonthOutlinedIcon,
            tone: "green",
        },
    ];

    return (
        <section className={styles.statsGrid} aria-label="Operational totals">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <article
                        key={card.label}
                        className={`${styles.statCard} ${card.primary ? styles.primaryStatCard : ""}`}
                    >
                        <span className={`${styles.statIcon} ${styles[`${card.tone}Icon`]}`}>
                            <Icon />
                        </span>
                        <div>
                            <span>{card.label}</span>
                            <strong>{card.value}</strong>
                            <small>{card.helper}</small>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

