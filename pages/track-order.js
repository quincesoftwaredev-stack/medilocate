import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import styles from "@/styles/Orders/TrackOrder.module.css";

const statusLabels = {
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    assigned: "Rider assigned",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    failed: "Failed",
};

const formatDate = (value) => value
    ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "Date unavailable";

const formatMoney = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

export default function TrackOrderPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const submit = async (event) => {
        event.preventDefault();
        const value = query.trim();
        if (!value) {
            setMessage("Enter your tracking number or delivery phone number.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            setOrders([]);
            const response = await fetch("/api/orders/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: value }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Unable to find this order.");

            if (data.mode === "tracking" && data.orders?.[0]?.lookupId) {
                await router.push(`/orders/${encodeURIComponent(data.orders[0].lookupId)}`);
                return;
            }

            setOrders(data.orders || []);
        } catch (error) {
            setMessage(error.message || "Order tracking is temporarily unavailable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Track Your Order | MediLocate</title>
                <meta name="description" content="Track a MediLocate medicine order using its tracking number or delivery phone number." />
            </Head>
            <main className={styles.page}>
                <section className={styles.hero}>
                    <div className={styles.container}>
                        <span className={styles.heroIcon}><LocalShippingOutlinedIcon /></span>
                        <span className={styles.eyebrow}>ORDER TRACKING</span>
                        <h1>Where is your order?</h1>
                        <p>Enter the tracking number from your confirmation or the complete phone number used for delivery.</p>

                        <form className={styles.searchCard} onSubmit={submit}>
                            <SearchRoundedIcon />
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Tracking number or phone number"
                                aria-label="Tracking number or delivery phone number"
                                autoComplete="off"
                            />
                            <button type="submit" disabled={loading}>
                                <span>{loading ? "Searching…" : "Track order"}</span>
                                <ArrowForwardRoundedIcon />
                            </button>
                        </form>
                        <small>Example: ML-TRK-4F8A21C9 or 017XXXXXXXX</small>
                    </div>
                </section>

                <section className={`${styles.container} ${styles.resultsSection}`}>
                    {message && <div className={styles.message} role="alert">{message}</div>}

                    {orders.length > 0 && (
                        <div className={styles.results}>
                            <div className={styles.resultsHeading}>
                                <div><span>MATCHING ORDERS</span><h2>Select an order to view its details</h2></div>
                                <strong>{orders.length} found</strong>
                            </div>
                            <div className={styles.orderList}>
                                {orders.map((order) => (
                                    <Link href={`/orders/${encodeURIComponent(order.lookupId)}`} className={styles.orderCard} key={order.lookupId}>
                                        <span className={styles.orderIcon}><ReceiptLongOutlinedIcon /></span>
                                        <span className={styles.orderCopy}>
                                            <strong>{order.reference}</strong>
                                            <small>{formatDate(order.createdAt)} · {order.totalItems} item{order.totalItems === 1 ? "" : "s"}</small>
                                        </span>
                                        <span className={styles.orderMeta}>
                                            <em className={`${styles.status} ${styles[order.status] || ""}`}>{statusLabels[order.status] || "Order status"}</em>
                                            <strong>{formatMoney(order.total)}</strong>
                                        </span>
                                        <ArrowForwardRoundedIcon className={styles.arrow} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {!orders.length && !message && (
                        <div className={styles.helpText}>
                            <strong>Tracking number</strong>
                            <span>You can find it on the order confirmation page or confirmation message.</span>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
