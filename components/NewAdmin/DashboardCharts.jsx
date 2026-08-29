import { useEffect, useState } from "react";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { formatCurrency } from "./dashboardData";
import styles from "@/styles/Admin/NewAdmin.module.css";

const formatShortDate = (value) => {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("en-BD", { month: "short", day: "numeric" });
};

const ChartTooltip = ({ active, payload, label, currency = false }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.chartTooltip}>
            <strong>{formatShortDate(label)}</strong>
            {payload.map((item) => (
                <span key={item.dataKey}>
                    <i style={{ background: item.color }} />
                    {item.name}: {currency ? formatCurrency(item.value) : item.value}
                </span>
            ))}
        </div>
    );
};

export default function DashboardCharts({ data = [], kpis = {}, sources = {} }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <section className={styles.commercialGrid}>
            <article className={`${styles.panel} ${styles.ordersChartPanel}`}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.panelEyebrow}>ORDER VOLUME</span>
                        <h2>Orders over time</h2>
                        <p>Created orders compared with successfully delivered orders.</p>
                    </div>
                    <div className={styles.chartMetric}>
                        <strong>{kpis.completionRate?.toFixed?.(1) || "0.0"}%</strong>
                        <span>Completion rate</span>
                    </div>
                </div>

                <div className={styles.chartArea}>
                    {mounted && data.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="orderVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f9d8a" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="#0f9d8a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="#e8eef1" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={formatShortDate} axisLine={false} tickLine={false} tick={{ fill: "#71808a", fontSize: 11 }} />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#71808a", fontSize: 11 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend iconType="circle" iconSize={8} />
                                <Area name="All orders" type="monotone" dataKey="orders" stroke="#0f9d8a" strokeWidth={3} fill="url(#orderVolume)" />
                                <Area name="Delivered" type="monotone" dataKey="delivered" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : <div className={styles.emptyChart}>No orders in this period.</div>}
                </div>
            </article>

            <article className={`${styles.panel} ${styles.revenueChartPanel}`}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.panelEyebrow}>DELIVERED REVENUE</span>
                        <h2>Revenue performance</h2>
                        <p>Only orders with delivered status are included.</p>
                    </div>
                    <div className={styles.chartMetric}>
                        <strong>{formatCurrency(kpis.averageOrderValue)}</strong>
                        <span>Average delivered order</span>
                    </div>
                </div>

                <div className={styles.chartArea}>
                    {mounted && data.length ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                                <CartesianGrid stroke="#e8eef1" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={formatShortDate} axisLine={false} tickLine={false} tick={{ fill: "#71808a", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71808a", fontSize: 11 }} />
                                <Tooltip content={<ChartTooltip currency />} />
                                <Bar name="Delivered revenue" dataKey="revenue" fill="#7861a7" radius={[7, 7, 0, 0]} maxBarSize={42} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <div className={styles.emptyChart}>No delivered revenue in this period.</div>}
                </div>

                <div className={styles.sourceCards}>
                    <div><span>Cart orders</span><strong>{sources.cart || 0}</strong></div>
                    <div><span>Prescription orders</span><strong>{sources.prescription || 0}</strong></div>
                </div>
            </article>
        </section>
    );
}

