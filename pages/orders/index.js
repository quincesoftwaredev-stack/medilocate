import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSelector } from "react-redux";
import axios from "axios";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import styles from "@/styles/Orders/Orders.module.css";

const filters = [{ value: "all", label: "All orders" }, { value: "active", label: "Active" }, { value: "delivered", label: "Delivered" }, { value: "cancelled", label: "Cancelled" }, { value: "failed", label: "Failed" }];
const activeStatuses = ["pending", "preparing", "ready", "assigned", "out_for_delivery"];
const statusMeta = {
  pending: ["Order placed", "pending", PendingOutlinedIcon], preparing: ["Preparing", "preparing", Inventory2OutlinedIcon],
  ready: ["Ready for delivery", "ready", CheckCircleRoundedIcon], assigned: ["Rider assigned", "assigned", LocalShippingOutlinedIcon],
  out_for_delivery: ["Out for delivery", "outForDelivery", LocalShippingOutlinedIcon], delivered: ["Delivered", "delivered", CheckCircleRoundedIcon],
  cancelled: ["Cancelled", "cancelled", CancelOutlinedIcon], failed: ["Failed", "failed", ErrorOutlineRoundedIcon],
};
const orderDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(date);
};

export default function OrdersPage() {
  const userInfo = useSelector((state) => state.user?.userInfo);
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userInfo?.token) { setLoading(false); return; }
    axios.get("/api/orders/my", { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setOrders(data.orders || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Orders could not be loaded."))
      .finally(() => setLoading(false));
  }, [userInfo?.token]);

  const normalized = useMemo(() => orders.map((order) => ({
    ...order, id: order._id, orderCode: order.trackingNumber || `Order ${String(order._id).slice(-8).toUpperCase()}`,
    date: orderDate(order.createdAt), totalItems: (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    source: order.prescription ? "prescription" : "cart", items: (order.items || []).map((item) => ({ name: item.medicine?.name || "Medicine", quantity: item.quantity })),
  })), [orders]);
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return normalized.filter((order) => {
      const matchesSearch = !query || order.orderCode.toLowerCase().includes(query) || order.items.some((item) => item.name.toLowerCase().includes(query));
      const matchesFilter = activeFilter === "all" || (activeFilter === "active" ? activeStatuses.includes(order.status) : order.status === activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, normalized, search]);
  const count = (type) => type === "active" ? normalized.filter((order) => activeStatuses.includes(order.status)).length : normalized.filter((order) => order.status === type).length;

  if (!userInfo?.token && !loading) return <main className={styles.page}><div className={styles.container}><div className={styles.emptyState}><ShoppingBagOutlinedIcon /><h3>Sign in to see your orders</h3><p>Your account orders will appear here.</p><Link href="/login" className={styles.viewButton}>Sign in</Link></div></div></main>;

  return <><Head><title>My Orders | MediLocate</title><meta name="description" content="View and track your MediLocate medicine orders." /></Head>
    <main className={styles.page}><div className={styles.container}>
      <header className={styles.header}><div><span>MEDICINE ORDERS</span><h1>My Orders</h1><p>View your medicine orders and track their delivery status.</p></div><Link href="/medicines" className={styles.shopButton}>Order Medicine <ArrowForwardRoundedIcon /></Link></header>
      <section className={styles.summaryGrid}>
        {[["all", "All Orders", ShoppingBagOutlinedIcon, normalized.length], ["active", "Active", LocalShippingOutlinedIcon, count("active")], ["delivered", "Delivered", CheckCircleRoundedIcon, count("delivered")], ["cancelled", "Cancelled", CancelOutlinedIcon, count("cancelled")]].map(([value, label, Icon, total]) => <button type="button" key={value} className={activeFilter === value ? styles.summaryCardActive : styles.summaryCard} onClick={() => setActiveFilter(value)}><Icon /><div><span>{label}</span><strong>{total}</strong></div></button>)}
      </section>
      <section className={styles.filterBar}><div className={styles.searchWrapper}><SearchRoundedIcon /><input type="text" placeholder="Search order ID or medicine..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className={styles.filterButtons}><FilterListRoundedIcon />{filters.map((filter) => <button type="button" key={filter.value} className={activeFilter === filter.value ? styles.filterActive : styles.filterButton} onClick={() => setActiveFilter(filter.value)}>{filter.label}</button>)}</div></section>
      <section className={styles.ordersCard}><div className={styles.ordersHeader}><div><span>ORDER HISTORY</span><h2>{filters.find((filter) => filter.value === activeFilter)?.label}</h2></div><strong>{filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}</strong></div>
        {loading ? <div className={styles.emptyState}><p>Loading your orders...</p></div> : error ? <div className={styles.emptyState}><ErrorOutlineRoundedIcon /><h3>Orders unavailable</h3><p>{error}</p></div> : filteredOrders.length ? <div className={styles.orderList}>{filteredOrders.map((order) => {
          const [statusLabel, statusClass, StatusIcon] = statusMeta[order.status] || ["Unknown", "pending", PendingOutlinedIcon];
          return <article key={order.id} className={styles.orderItem}><div className={styles.orderTop}><div className={styles.orderIdentity}><div className={styles.orderIcon}><ShoppingBagOutlinedIcon /></div><div><strong>{order.orderCode}</strong><span>{order.date}</span></div></div><span className={`${styles.statusBadge} ${styles[statusClass]}`}><StatusIcon />{statusLabel}</span></div>
            <div className={styles.items}>{order.items.map((item, index) => <span key={`${order.id}-${index}`}>{item.name} {"\u00D7"} {item.quantity}</span>)}</div>
            <div className={styles.orderFooter}><div className={styles.orderMeta}><span><CalendarTodayOutlinedIcon />{order.date}</span><span><DescriptionOutlinedIcon />{order.source === "prescription" ? "Prescription order" : "Medicine cart"}</span></div><div className={styles.orderAction}><strong>{"\u09F3"}{Number(order.total || 0).toLocaleString("en-BD")}</strong><Link href={`/orders/${order.trackingNumber || order.id}`} className={styles.viewButton}>{activeStatuses.includes(order.status) ? "Track Order" : "View Order"}<ArrowForwardRoundedIcon /></Link></div></div>
          </article>;
        })}</div> : <div className={styles.emptyState}><ShoppingBagOutlinedIcon /><h3>No orders found</h3><p>No orders match the current filter.</p><button type="button" onClick={() => { setActiveFilter("all"); setSearch(""); }}>View all orders</button></div>}
      </section>
    </div></main></>;
}
