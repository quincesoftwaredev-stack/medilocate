import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import styles from "@/styles/Doctor/Dashboard.module.css";

const shortDate = (value) => new Date(value + "T00:00:00").toLocaleDateString("en-BD", { month: "short", day: "numeric" });
const money = (value) => "\u09F3" + Number(value || 0).toLocaleString("en-BD");

function TooltipCard({ active, payload, label, currency = false }) {
  if (!active || !payload?.length) return null;
  return <div className={styles.chartTooltip}><strong>{shortDate(label)}</strong>{payload.map((item) =>
    <span key={item.dataKey}><i style={{ background: item.color }} />{item.name}: {currency ? money(item.value) : item.value}</span>)}</div>;
}

export default function DoctorDashboardCharts({ charts = {} }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const trend = charts.trend || [];
  const types = charts.consultationTypes || {};
  return <section className={styles.chartGrid}>
    <article className={styles.chartPanel}>
      <div className={styles.chartHeader}><div><small>LAST 30 DAYS</small><h2>Appointments over time</h2><p>Booked appointments compared with completed consultations.</p></div></div>
      <div className={styles.chartArea}>{mounted && <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
          <defs><linearGradient id="doctorAppointments" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f9d8a" stopOpacity=".28" /><stop offset="95%" stopColor="#0f9d8a" stopOpacity="0" /></linearGradient></defs>
          <CartesianGrid stroke="#e8eef1" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} minTickGap={24} tick={{ fill: "#71808a", fontSize: 11 }} />
          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#71808a", fontSize: 11 }} />
          <Tooltip content={<TooltipCard />} /><Legend iconType="circle" iconSize={8} />
          <Area name="Appointments" type="monotone" dataKey="appointments" stroke="#0f9d8a" strokeWidth={3} fill="url(#doctorAppointments)" />
          <Area name="Completed" type="monotone" dataKey="completed" stroke="#3775ac" strokeWidth={2} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>}</div>
    </article>
    <article className={styles.chartPanel}>
      <div className={styles.chartHeader}><div><small>LAST 30 DAYS</small><h2>Earnings trend</h2><p>Completed and paid consultation earnings.</p></div></div>
      <div className={styles.chartArea}>{mounted && <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trend} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#e8eef1" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tickFormatter={shortDate} axisLine={false} tickLine={false} minTickGap={24} tick={{ fill: "#71808a", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71808a", fontSize: 11 }} />
          <Tooltip content={<TooltipCard currency />} />
          <Bar name="Earnings" dataKey="earnings" fill="#7861a7" radius={[7, 7, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>}</div>
      <div className={styles.typeSummary}>
        <div><span>Online</span><strong>{types.online || 0}</strong></div>
        <div><span>Chamber</span><strong>{types.chamber || 0}</strong></div>
        <div><span>Home visit</span><strong>{types.home || 0}</strong></div>
      </div>
    </article>
  </section>;
}
