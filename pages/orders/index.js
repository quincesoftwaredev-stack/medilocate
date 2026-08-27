import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";

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

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Orders/Orders.module.css";


/*
|--------------------------------------------------------------------------
| TEMPORARY ORDER DATA
|--------------------------------------------------------------------------
| Later:
|
| GET /api/orders
|
*/

const orders = [
    {
        id: "1",
        orderCode: "ML-O-20451",
        source: "prescription",
        requestCode: "ML-P-10284",

        date: "26 Aug 2026, 11:18 AM",

        items: [
            {
                name: "Napa",
                quantity: 2,
            },
            {
                name: "Seclo",
                quantity: 1,
            },
            {
                name: "DP-2",
                quantity: 4,
            },
        ],

        totalItems: 7,
        total: 189,

        status: "out_for_delivery",

        estimatedDelivery: "Today, 2:30 PM – 3:30 PM",
    },

    {
        id: "2",
        orderCode: "ML-O-20450",
        source: "cart",

        date: "26 Aug 2026, 10:52 AM",

        items: [
            {
                name: "Napa",
                quantity: 2,
            },
            {
                name: "Napa Extra",
                quantity: 1,
            },
        ],

        totalItems: 3,
        total: 310,

        status: "preparing",

        estimatedDelivery: "Today, 4:00 PM – 5:00 PM",
    },

    {
        id: "3",
        orderCode: "ML-O-20442",
        source: "cart",

        date: "23 Aug 2026, 03:42 PM",

        items: [
            {
                name: "Napa",
                quantity: 2,
            },
            {
                name: "Ceevit",
                quantity: 2,
            },
        ],

        totalItems: 4,
        total: 240,

        status: "delivered",

        deliveredAt: "23 Aug 2026, 06:12 PM",
    },

    {
        id: "4",
        orderCode: "ML-O-20431",
        source: "prescription",
        requestCode: "ML-P-10271",

        date: "20 Aug 2026, 11:24 AM",

        items: [
            {
                name: "Seclo",
                quantity: 2,
            },
            {
                name: "DP-2",
                quantity: 2,
            },
            {
                name: "Napa",
                quantity: 1,
            },
        ],

        totalItems: 5,
        total: 465,

        status: "delivered",

        deliveredAt: "20 Aug 2026, 03:50 PM",
    },

    {
        id: "5",
        orderCode: "ML-O-20420",
        source: "prescription",
        requestCode: "ML-P-10260",

        date: "17 Aug 2026, 05:08 PM",

        items: [
            {
                name: "Napa",
                quantity: 2,
            },
            {
                name: "Seclo",
                quantity: 1,
            },
        ],

        totalItems: 3,
        total: 210,

        status: "cancelled",

        statusReason:
            "Order cancelled by patient.",
    },

    {
        id: "6",
        orderCode: "ML-O-20412",
        source: "cart",

        date: "14 Aug 2026, 02:19 PM",

        items: [
            {
                name: "DP-2",
                quantity: 2,
            },
        ],

        totalItems: 2,
        total: 140,

        status: "failed",

        statusReason:
            "Delivery could not be completed.",
    },

    {
        id: "7",
        orderCode: "ML-O-20398",
        source: "cart",

        date: "10 Aug 2026, 10:12 AM",

        items: [
            {
                name: "Ceevit",
                quantity: 2,
            },
        ],

        totalItems: 2,
        total: 90,

        status: "delivered",

        deliveredAt: "10 Aug 2026, 01:17 PM",
    },
];


const filters = [
    {
        value: "all",
        label: "All orders",
    },
    {
        value: "active",
        label: "Active",
    },
    {
        value: "delivered",
        label: "Delivered",
    },
    {
        value: "cancelled",
        label: "Cancelled",
    },
    {
        value: "failed",
        label: "Failed",
    },
];


const activeStatuses = [
    "pending",
    "preparing",
    "ready",
    "assigned",
    "out_for_delivery",
];


const getStatusMeta = (status) => {

    switch (status) {

        case "pending":
            return {
                label: "Order placed",
                className: "pending",
                icon: PendingOutlinedIcon,
            };

        case "preparing":
            return {
                label: "Preparing",
                className: "preparing",
                icon: Inventory2OutlinedIcon,
            };

        case "ready":
            return {
                label: "Ready for delivery",
                className: "ready",
                icon: CheckCircleRoundedIcon,
            };

        case "assigned":
            return {
                label: "Rider assigned",
                className: "assigned",
                icon: LocalShippingOutlinedIcon,
            };

        case "out_for_delivery":
            return {
                label: "Out for delivery",
                className: "outForDelivery",
                icon: LocalShippingOutlinedIcon,
            };

        case "delivered":
            return {
                label: "Delivered",
                className: "delivered",
                icon: CheckCircleRoundedIcon,
            };

        case "cancelled":
            return {
                label: "Cancelled",
                className: "cancelled",
                icon: CancelOutlinedIcon,
            };

        case "failed":
            return {
                label: "Failed",
                className: "failed",
                icon: ErrorOutlineRoundedIcon,
            };

        default:
            return {
                label: "Unknown",
                className: "pending",
                icon: PendingOutlinedIcon,
            };

    }

};


export default function OrdersPage() {

    const [activeFilter, setActiveFilter] =
        useState("all");


    const [search, setSearch] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | COUNTS
    |--------------------------------------------------------------------------
    */

    const activeCount =
        orders.filter(
            (order) =>
                activeStatuses.includes(
                    order.status
                )
        ).length;


    const deliveredCount =
        orders.filter(
            (order) =>
                order.status === "delivered"
        ).length;


    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filteredOrders =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return orders.filter(
                (order) => {

                    const matchesSearch =
                        !query ||
                        order.orderCode
                            .toLowerCase()
                            .includes(query) ||
                        order.requestCode
                            ?.toLowerCase()
                            .includes(query) ||
                        order.items.some(
                            (item) =>
                                item.name
                                    .toLowerCase()
                                    .includes(query)
                        );


                    let matchesFilter = true;


                    if (
                        activeFilter ===
                        "active"
                    ) {

                        matchesFilter =
                            activeStatuses.includes(
                                order.status
                            );

                    } else if (
                        activeFilter ===
                        "delivered"
                    ) {

                        matchesFilter =
                            order.status ===
                            "delivered";

                    } else if (
                        activeFilter ===
                        "cancelled"
                    ) {

                        matchesFilter =
                            order.status ===
                            "cancelled";

                    } else if (
                        activeFilter ===
                        "failed"
                    ) {

                        matchesFilter =
                            order.status ===
                            "failed";

                    }


                    return (
                        matchesSearch &&
                        matchesFilter
                    );

                }
            );

        }, [
            activeFilter,
            search,
        ]);


    return (
        <>
            <Head>

                <title>
                    My Orders | MediLocate
                </title>

                <meta
                    name="description"
                    content="View and track your MediLocate medicine orders."
                />

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.header}>

                        <div>

                            <span>
                                MEDICINE ORDERS
                            </span>

                            <h1>
                                My Orders
                            </h1>

                            <p>
                                View your medicine orders and
                                track their delivery status.
                            </p>

                        </div>


                        <Link
                            href="/medicines"
                            className={
                                styles.shopButton
                            }
                        >

                            Order Medicine

                            <ArrowForwardRoundedIcon />

                        </Link>

                    </header>


                    {/* =====================================================
                        SUMMARY
                    ====================================================== */}

                    <section className={styles.summaryGrid}>

                        <button
                            type="button"
                            className={
                                activeFilter === "all"
                                    ? styles.summaryCardActive
                                    : styles.summaryCard
                            }
                            onClick={() =>
                                setActiveFilter("all")
                            }
                        >

                            <ShoppingBagOutlinedIcon />

                            <div>

                                <span>
                                    All Orders
                                </span>

                                <strong>
                                    {orders.length}
                                </strong>

                            </div>

                        </button>


                        <button
                            type="button"
                            className={
                                activeFilter === "active"
                                    ? styles.summaryCardActive
                                    : styles.summaryCard
                            }
                            onClick={() =>
                                setActiveFilter("active")
                            }
                        >

                            <LocalShippingOutlinedIcon />

                            <div>

                                <span>
                                    Active
                                </span>

                                <strong>
                                    {activeCount}
                                </strong>

                            </div>

                        </button>


                        <button
                            type="button"
                            className={
                                activeFilter === "delivered"
                                    ? styles.summaryCardActive
                                    : styles.summaryCard
                            }
                            onClick={() =>
                                setActiveFilter(
                                    "delivered"
                                )
                            }
                        >

                            <CheckCircleRoundedIcon />

                            <div>

                                <span>
                                    Delivered
                                </span>

                                <strong>
                                    {deliveredCount}
                                </strong>

                            </div>

                        </button>


                        <button
                            type="button"
                            className={
                                activeFilter === "cancelled"
                                    ? styles.summaryCardActive
                                    : styles.summaryCard
                            }
                            onClick={() =>
                                setActiveFilter(
                                    "cancelled"
                                )
                            }
                        >

                            <CancelOutlinedIcon />

                            <div>

                                <span>
                                    Cancelled
                                </span>

                                <strong>
                                    {
                                        orders.filter(
                                            (order) =>
                                                order.status ===
                                                "cancelled"
                                        ).length
                                    }
                                </strong>

                            </div>

                        </button>

                    </section>


                    {/* =====================================================
                        FILTER BAR
                    ====================================================== */}

                    <section
                        className={
                            styles.filterBar
                        }
                    >

                        <div
                            className={
                                styles.searchWrapper
                            }
                        >

                            <SearchRoundedIcon />

                            <input
                                type="text"
                                placeholder="Search order ID or medicine..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div
                            className={
                                styles.filterButtons
                            }
                        >

                            <FilterListRoundedIcon />

                            {filters.map(
                                (filter) => (

                                    <button
                                        type="button"
                                        key={
                                            filter.value
                                        }
                                        className={
                                            activeFilter ===
                                            filter.value
                                                ? styles.filterActive
                                                : styles.filterButton
                                        }
                                        onClick={() =>
                                            setActiveFilter(
                                                filter.value
                                            )
                                        }
                                    >

                                        {filter.label}

                                    </button>

                                )
                            )}

                        </div>

                    </section>


                    {/* =====================================================
                        RESULTS
                    ====================================================== */}

                    <section
                        className={
                            styles.ordersCard
                        }
                    >

                        <div
                            className={
                                styles.ordersHeader
                            }
                        >

                            <div>

                                <span>
                                    ORDER HISTORY
                                </span>

                                <h2>
                                    {activeFilter === "all"
                                        ? "All orders"
                                        : filters.find(
                                              (filter) =>
                                                  filter.value ===
                                                  activeFilter
                                          )?.label}
                                </h2>

                            </div>


                            <strong>
                                {filteredOrders.length}
                                {" "}
                                {filteredOrders.length ===
                                1
                                    ? "order"
                                    : "orders"}
                            </strong>

                        </div>


                        {filteredOrders.length > 0 ? (

                            <div
                                className={
                                    styles.orderList
                                }
                            >

                                {filteredOrders.map(
                                    (order) => {

                                        const meta =
                                            getStatusMeta(
                                                order.status
                                            );

                                        const StatusIcon =
                                            meta.icon;


                                        return (

                                            <article
                                                key={
                                                    order.id
                                                }
                                                className={
                                                    styles.orderItem
                                                }
                                            >

                                                {/* =================================
                                                    TOP
                                                ================================== */}

                                                <div
                                                    className={
                                                        styles.orderTop
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.orderIdentity
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.orderIcon
                                                            }
                                                        >

                                                            <ShoppingBagOutlinedIcon />

                                                        </div>


                                                        <div>

                                                            <strong>
                                                                {
                                                                    order.orderCode
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    order.date
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`${styles.statusBadge} ${styles[meta.className]}`}
                                                    >

                                                        <StatusIcon />

                                                        {
                                                            meta.label
                                                        }

                                                    </span>

                                                </div>


                                                {/* =================================
                                                    ITEMS
                                                ================================== */}

                                                <div
                                                    className={
                                                        styles.items
                                                    }
                                                >

                                                    {order.items.map(
                                                        (
                                                            item
                                                        ) => (

                                                            <span
                                                                key={
                                                                    `${order.id}-${item.name}`
                                                                }
                                                            >

                                                                {
                                                                    item.name
                                                                }
                                                                {" × "}
                                                                {
                                                                    item.quantity
                                                                }

                                                            </span>

                                                        )
                                                    )}

                                                </div>


                                                {/* =================================
                                                    FOOTER
                                                ================================== */}

                                                <div
                                                    className={
                                                        styles.orderFooter
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.orderMeta
                                                        }
                                                    >

                                                        <span>

                                                            <CalendarTodayOutlinedIcon />

                                                            {
                                                                order.date
                                                            }

                                                        </span>


                                                        <span>

                                                            <DescriptionOutlinedIcon />

                                                            {
                                                                order.source ===
                                                                "prescription"
                                                                    ? "Prescription order"
                                                                    : "Medicine cart"
                                                            }

                                                        </span>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.orderAction
                                                        }
                                                    >

                                                        <strong>
                                                            ৳
                                                            {
                                                                order.total
                                                            }
                                                        </strong>


                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className={
                                                                styles.viewButton
                                                            }
                                                        >

                                                            {activeStatuses.includes(
                                                                order.status
                                                            )
                                                                ? "Track Order"
                                                                : "View Order"}

                                                            <ArrowForwardRoundedIcon />

                                                        </Link>

                                                    </div>

                                                </div>


                                                {/* =================================
                                                    ACTIVE ETA
                                                ================================== */}

                                                {activeStatuses.includes(
                                                    order.status
                                                ) &&
                                                    order.estimatedDelivery && (

                                                        <div
                                                            className={
                                                                styles.eta
                                                            }
                                                        >

                                                            <LocalShippingOutlinedIcon />

                                                            <span>
                                                                Estimated delivery:
                                                                {" "}
                                                                <strong>
                                                                    {
                                                                        order.estimatedDelivery
                                                                    }
                                                                </strong>
                                                            </span>

                                                        </div>

                                                    )}


                                                {/* =================================
                                                    FAILED / CANCELLED
                                                ================================== */}

                                                {(order.status ===
                                                    "cancelled" ||
                                                    order.status ===
                                                        "failed") &&
                                                    order.statusReason && (

                                                        <div
                                                            className={`${styles.reason} ${
                                                                order.status ===
                                                                "failed"
                                                                    ? styles.failedReason
                                                                    : ""
                                                            }`}
                                                        >

                                                            {order.status ===
                                                            "failed" ? (
                                                                <ErrorOutlineRoundedIcon />
                                                            ) : (
                                                                <CancelOutlinedIcon />
                                                            )}

                                                            <span>
                                                                {
                                                                    order.statusReason
                                                                }
                                                            </span>

                                                        </div>

                                                    )}

                                            </article>

                                        );

                                    }
                                )}

                            </div>

                        ) : (

                            <div
                                className={
                                    styles.emptyState
                                }
                            >

                                <ShoppingBagOutlinedIcon />

                                <h3>
                                    No orders found
                                </h3>

                                <p>
                                    No orders match the
                                    current filter.
                                </p>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setActiveFilter(
                                            "all"
                                        );

                                        setSearch("");

                                    }}
                                >
                                    View all orders
                                </button>

                            </div>

                        )}

                    </section>

                </div>

            </main>


            <Footer />

        </>
    );
}