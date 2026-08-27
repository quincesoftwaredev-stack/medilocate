import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import Pagination from "@mui/material/Pagination";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

import styles from "@/styles/Admin/Orders/Orders.module.css";
import BASE_URL from "@/config";


/*
|--------------------------------------------------------------------------
| STATUS OPTIONS
|--------------------------------------------------------------------------
*/

const statusOptions = [
    {
        value: "all",
        label: "All Orders",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "preparing",
        label: "Preparing",
    },
    {
        value: "ready",
        label: "Ready",
    },
    {
        value: "assigned",
        label: "Assigned",
    },
    {
        value: "out_for_delivery",
        label: "Out for Delivery",
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


/*
|--------------------------------------------------------------------------
| ORDERS PER PAGE
|--------------------------------------------------------------------------
*/

const ORDERS_PER_PAGE = 10;


/*
|--------------------------------------------------------------------------
| STATUS META
|--------------------------------------------------------------------------
*/

const getStatusMeta = (status) => {

    switch (status) {

        case "pending":
            return {
                label: "Pending",
                className: "pending",
                icon: PendingOutlinedIcon,
            };

        case "preparing":
            return {
                label: "Preparing",
                className: "preparing",
                icon: ShoppingBagOutlinedIcon,
            };

        case "ready":
            return {
                label: "Ready",
                className: "ready",
                icon: CheckCircleOutlineRoundedIcon,
            };

        case "assigned":
            return {
                label: "Assigned",
                className: "assigned",
                icon: LocalShippingOutlinedIcon,
            };

        case "out_for_delivery":
            return {
                label: "Out for Delivery",
                className: "outForDelivery",
                icon: LocalShippingOutlinedIcon,
            };

        case "delivered":
            return {
                label: "Delivered",
                className: "delivered",
                icon: CheckCircleOutlineRoundedIcon,
            };

        case "cancelled":
            return {
                label: "Cancelled",
                className: "cancelled",
                icon: MoreHorizRoundedIcon,
            };

        case "failed":
            return {
                label: "Failed",
                className: "failed",
                icon: MoreHorizRoundedIcon,
            };

        default:
            return {
                label: status || "Unknown",
                className: "pending",
                icon: PendingOutlinedIcon,
            };

    }

};


/*
|--------------------------------------------------------------------------
| SOURCE LABEL
|--------------------------------------------------------------------------
*/

const getSourceLabel = (source) => {

    if (source === "prescription") {
        return "Prescription";
    }

    return "Cart";

};


/*
|--------------------------------------------------------------------------
| DATE FORMAT
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

    if (!date) {
        return "N/A";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
        return "N/A";
    }

    return parsedDate.toLocaleString(
        "en-BD",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );

};


/*
|--------------------------------------------------------------------------
| GET SERVER SIDE PROPS
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(context) {

    try {

        const {
            req
        } = context;


        /*
        |--------------------------------------------------------------------------
        | COOKIES
        |--------------------------------------------------------------------------
        */

        const cookies =
            req.headers.cookie || "";


        /*
        |--------------------------------------------------------------------------
        | FETCH ORDERS
        |--------------------------------------------------------------------------
        */

        const response =
            await axios.get(

                `${BASE_URL}/api/admin/orders`,

                {

                    headers: {

                        Cookie:
                            cookies,

                    },

                }

            );


        /*
        |--------------------------------------------------------------------------
        | HANDLE DIFFERENT RESPONSE SHAPES
        |--------------------------------------------------------------------------
        |
        | Supports:
        |
        | {
        |    orders: [...]
        | }
        |
        | OR
        |
        | [...]
        |
        */

        let orders = [];

        if (
            Array.isArray(
                response.data
            )
        ) {

            orders =
                response.data;

        } else if (
            Array.isArray(
                response.data?.orders
            )
        ) {

            orders =
                response.data.orders;

        }


        /*
        |--------------------------------------------------------------------------
        | SERIALIZE MONGOOSE DATA
        |--------------------------------------------------------------------------
        */

        orders =
            JSON.parse(
                JSON.stringify(
                    orders
                )
            );


        console.log(
            "ADMIN ORDERS COUNT:",
            orders.length
        );


        return {

            props: {

                orders,

            },

        };

    } catch (error) {

        console.log(
            "ADMIN ORDERS SSR ERROR:",
            error.response?.data ||
            error.message
        );


        return {

            props: {

                orders: [],

            },

        };

    }

}


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function OrdersPage({
    orders = [],
}) {

    /*
    |--------------------------------------------------------------------------
    | FILTER STATES
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const [dateFilter, setDateFilter] =
        useState("all");


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [page, setPage] =
        useState(1);


    /*
    |--------------------------------------------------------------------------
    | FILTER ORDERS
    |--------------------------------------------------------------------------
    */

    const filteredOrders =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();


            return orders.filter(
                (order) => {

                    /*
                    |--------------------------------------------------------------------------
                    | SEARCH
                    |--------------------------------------------------------------------------
                    */

                    const searchableValues = [

                        order.orderCode,

                        order.trackingNumber,

                        order.patientName,

                        order.phone,

                        order.requestCode,

                        order.address,

                        order.status,

                    ];


                    const matchesSearch =
                        !searchValue ||
                        searchableValues.some(
                            (value) =>
                                String(
                                    value || ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        searchValue
                                    )
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | STATUS
                    |--------------------------------------------------------------------------
                    */

                    const matchesStatus =
                        status === "all" ||
                        String(
                            order.status || ""
                        ).toLowerCase() ===
                            status.toLowerCase();


                    /*
                    |--------------------------------------------------------------------------
                    | DATE
                    |--------------------------------------------------------------------------
                    */

                    let matchesDate = true;


                    if (
                        dateFilter !== "all"
                    ) {

                        const orderDate =
                            new Date(
                                order.createdAt
                            );


                        const now =
                            new Date();


                        if (
                            isNaN(
                                orderDate.getTime()
                            )
                        ) {

                            matchesDate =
                                false;

                        } else if (
                            dateFilter ===
                            "today"
                        ) {

                            matchesDate =
                                orderDate.toDateString() ===
                                now.toDateString();

                        } else if (
                            dateFilter ===
                            "week"
                        ) {

                            const sevenDaysAgo =
                                new Date();

                            sevenDaysAgo.setDate(
                                now.getDate() - 7
                            );


                            matchesDate =
                                orderDate >=
                                sevenDaysAgo;

                        } else if (
                            dateFilter ===
                            "month"
                        ) {

                            matchesDate =
                                orderDate.getMonth() ===
                                    now.getMonth() &&
                                orderDate.getFullYear() ===
                                    now.getFullYear();

                        }

                    }


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesDate
                    );

                }
            );

        }, [
            orders,
            search,
            status,
            dateFilter,
        ]);


    /*
    |--------------------------------------------------------------------------
    | RESET PAGE WHEN FILTER CHANGES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setPage(1);

    }, [
        search,
        status,
        dateFilter,
    ]);


    /*
    |--------------------------------------------------------------------------
    | PAGINATION CALCULATION
    |--------------------------------------------------------------------------
    */

    const totalPages =
        Math.ceil(
            filteredOrders.length /
            ORDERS_PER_PAGE
        );


    /*
    |--------------------------------------------------------------------------
    | CURRENT PAGE ORDERS
    |--------------------------------------------------------------------------
    */

    const paginatedOrders =
        useMemo(() => {

            const startIndex =
                (page - 1) *
                ORDERS_PER_PAGE;


            const endIndex =
                startIndex +
                ORDERS_PER_PAGE;


            return filteredOrders.slice(
                startIndex,
                endIndex
            );

        }, [
            filteredOrders,
            page,
        ]);


    /*
    |--------------------------------------------------------------------------
    | HANDLE PAGE CHANGE
    |--------------------------------------------------------------------------
    */

    const handlePageChange = (
        event,
        value
    ) => {

        setPage(value);


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS COUNT
    |--------------------------------------------------------------------------
    */

    const countByStatus = (
        value
    ) => {

        if (value === "all") {

            return orders.length;

        }


        return orders.filter(
            (order) =>
                String(
                    order.status || ""
                ).toLowerCase() ===
                value.toLowerCase()
        ).length;

    };


    /*
    |--------------------------------------------------------------------------
    | TOTAL REVENUE
    |--------------------------------------------------------------------------
    */

    const totalRevenue =
        orders
            .filter(
                (order) =>
                    order.status !==
                    "cancelled"
            )
            .reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    Number(
                        order.total || 0
                    ),
                0
            );


    /*
    |--------------------------------------------------------------------------
    | RESET FILTERS
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {

        setSearch("");

        setStatus("all");

        setDateFilter("all");

        setPage(1);

    };


    /*
    |--------------------------------------------------------------------------
    | ORDER ID
    |--------------------------------------------------------------------------
    */

    const getOrderId = (
        order
    ) => {

        return (
            order.id ||
            order._id
        );

    };


    return (
        <>

            <Head>

                <title>
                    Orders | MediLocate Admin
                </title>

            </Head>




            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.pageHeader}>

                        <div>

                            <div
                                className={
                                    styles.titleRow
                                }
                            >

                                <div
                                    className={
                                        styles.titleIcon
                                    }
                                >

                                    <ShoppingBagOutlinedIcon />

                                </div>


                                <div>

                                    <span
                                        className={
                                            styles.eyebrow
                                        }
                                    >
                                        ORDER MANAGEMENT
                                    </span>

                                    <h1>
                                        Orders
                                    </h1>

                                </div>

                            </div>


                            <p>
                                Manage medicine orders and
                                prepare them for delivery.
                            </p>

                        </div>


                        <button
                            type="button"
                            className={
                                styles.refreshButton
                            }
                            onClick={() =>
                                window.location.reload()
                            }
                        >

                            <RefreshRoundedIcon />

                            Refresh

                        </button>

                    </header>


                    {/* =====================================================
                        STATS
                    ====================================================== */}

                    <section className={styles.statsGrid}>

                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={
                                    styles.statIcon
                                }
                            >

                                <ShoppingBagOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Total Orders
                                </span>

                                <strong>
                                    {orders.length}
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.pendingIcon}`}
                            >

                                <PendingOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {countByStatus(
                                        "pending"
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.deliveryIcon}`}
                            >

                                <LocalShippingOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    On Delivery
                                </span>

                                <strong>
                                    {
                                        countByStatus(
                                            "out_for_delivery"
                                        )
                                    }
                                </strong>

                            </div>

                        </div>


                        <div
                            className={
                                styles.statCard
                            }
                        >

                            <div
                                className={`${styles.statIcon} ${styles.completedIcon}`}
                            >

                                <CheckCircleOutlineRoundedIcon />

                            </div>


                            <div>

                                <span>
                                    Delivered
                                </span>

                                <strong>
                                    {countByStatus(
                                        "delivered"
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div
                            className={`${styles.statCard} ${styles.revenueCard}`}
                        >

                            <div
                                className={`${styles.statIcon} ${styles.revenueIcon}`}
                            >

                                <PaymentsOutlinedIcon />

                            </div>


                            <div>

                                <span>
                                    Order Value
                                </span>

                                <strong>
                                    ৳
                                    {totalRevenue}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        FILTER BAR
                    ====================================================== */}

                    <section
                        className={
                            styles.filterCard
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
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search order ID, tracking number, patient, phone or request ID..."
                            />

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <FilterListRoundedIcon />

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                            >

                                {statusOptions.map(
                                    (option) => (

                                        <option
                                            key={
                                                option.value
                                            }
                                            value={
                                                option.value
                                            }
                                        >
                                            {
                                                option.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        <div
                            className={
                                styles.filterControl
                            }
                        >

                            <CalendarTodayOutlinedIcon />

                            <select
                                value={
                                    dateFilter
                                }
                                onChange={(event) =>
                                    setDateFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="all">
                                    All Dates
                                </option>

                                <option value="today">
                                    Today
                                </option>

                                <option value="week">
                                    Last 7 Days
                                </option>

                                <option value="month">
                                    This Month
                                </option>

                            </select>

                        </div>


                        {(search ||
                            status !== "all" ||
                            dateFilter !== "all") && (

                            <button
                                type="button"
                                className={
                                    styles.clearFilters
                                }
                                onClick={
                                    resetFilters
                                }
                            >
                                Clear
                            </button>

                        )}

                    </section>


                    {/* =====================================================
                        ORDERS
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

                                <h2>
                                    Orders
                                </h2>

                                <span>

                                    {filteredOrders.length}

                                    {" "}

                                    {filteredOrders.length ===
                                    1
                                        ? "order"
                                        : "orders"}

                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div
                            className={
                                styles.tableWrapper
                            }
                        >

                            <table
                                className={
                                    styles.table
                                }
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Order
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Source
                                        </th>

                                        <th>
                                            Items
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Created
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {paginatedOrders.map(
                                        (order) => {

                                            const meta =
                                                getStatusMeta(
                                                    order.status
                                                );

                                            const StatusIcon =
                                                meta.icon;

                                            const orderId =
                                                getOrderId(
                                                    order
                                                );


                                            return (

                                                <tr
                                                    key={
                                                        orderId
                                                    }
                                                >

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.orderInfo
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    order.orderCode ||
                                                                    orderId
                                                                }
                                                            </strong>


                                                            {order.trackingNumber && (

                                                                <span>
                                                                    {
                                                                        order.trackingNumber
                                                                    }
                                                                </span>

                                                            )}


                                                            {order.requestCode && (

                                                                <span>
                                                                    {
                                                                        order.requestCode
                                                                    }
                                                                </span>

                                                            )}

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className={
                                                                styles.patientInfo
                                                            }
                                                        >

                                                            <div
                                                                className={
                                                                    styles.avatar
                                                                }
                                                            >
                                                                {
                                                                    order.patientName
                                                                        ?.charAt(
                                                                            0
                                                                        )
                                                                        ?.toUpperCase()
                                                                }
                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        order.patientName ||
                                                                        "N/A"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        order.phone ||
                                                                        "N/A"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                order.source ===
                                                                "prescription"
                                                                    ? styles.prescriptionSource
                                                                    : styles.cartSource
                                                            }
                                                        >

                                                            {
                                                                getSourceLabel(
                                                                    order.source
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className={
                                                                styles.itemsCell
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    order.items ??
                                                                    0
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    order.totalItems ??
                                                                    0
                                                                }{" "}
                                                                units
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div
                                                            className={
                                                                styles.amountCell
                                                            }
                                                        >

                                                            <strong>
                                                                ৳
                                                                {
                                                                    order.total ??
                                                                    0
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    order.paymentMethod ===
                                                                    "cod"
                                                                        ? "Cash on Delivery"
                                                                        : "Online"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={`${styles.statusBadge} ${styles[meta.className]}`}
                                                        >

                                                            <StatusIcon />

                                                            {
                                                                meta.label
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                styles.createdAt
                                                            }
                                                        >
                                                            {
                                                                formatDate(
                                                                    order.createdAt
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <Link
                                                            href={`/admin/orders/${orderId}`}
                                                            className={
                                                                styles.manageButton
                                                            }
                                                        >

                                                            <VisibilityOutlinedIcon />

                                                            Manage

                                                        </Link>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            MOBILE CARDS
                        ================================================== */}

                        <div
                            className={
                                styles.mobileOrders
                            }
                        >

                            {paginatedOrders.map(
                                (order) => {

                                    const meta =
                                        getStatusMeta(
                                            order.status
                                        );

                                    const StatusIcon =
                                        meta.icon;

                                    const orderId =
                                        getOrderId(
                                            order
                                        );


                                    return (

                                        <article
                                            key={
                                                orderId
                                            }
                                            className={
                                                styles.mobileOrder
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.mobileTop
                                                }
                                            >

                                                <div>

                                                    <span
                                                        className={
                                                            styles.mobileOrderCode
                                                        }
                                                    >
                                                        {
                                                            order.orderCode ||
                                                            orderId
                                                        }
                                                    </span>


                                                    <h3>
                                                        {
                                                            order.patientName ||
                                                            "N/A"
                                                        }
                                                    </h3>

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


                                            <div
                                                className={
                                                    styles.mobileDetails
                                                }
                                            >

                                                <div>

                                                    <PersonOutlineRoundedIcon />

                                                    <span>
                                                        {
                                                            order.patientName ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <PhoneOutlinedIcon />

                                                    <span>
                                                        {
                                                            order.phone ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <LocationOnOutlinedIcon />

                                                    <span>
                                                        {
                                                            order.address ||
                                                            "N/A"
                                                        }
                                                    </span>

                                                </div>


                                                <div>

                                                    <PaymentsOutlinedIcon />

                                                    <span>
                                                        ৳
                                                        {
                                                            order.total ??
                                                            0
                                                        }

                                                        {" • "}

                                                        {
                                                            order.paymentMethod ===
                                                            "cod"
                                                                ? "Cash on Delivery"
                                                                : "Online"
                                                        }

                                                    </span>

                                                </div>


                                                <div>

                                                    <CalendarTodayOutlinedIcon />

                                                    <span>
                                                        {
                                                            formatDate(
                                                                order.createdAt
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>


                                            <div
                                                className={
                                                    styles.mobileFooter
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.mobileSource
                                                    }
                                                >

                                                    <span
                                                        className={
                                                            order.source ===
                                                            "prescription"
                                                                ? styles.prescriptionSource
                                                                : styles.cartSource
                                                        }
                                                    >
                                                        {
                                                            getSourceLabel(
                                                                order.source
                                                            )
                                                        }
                                                    </span>


                                                    <span>
                                                        {
                                                            order.items ??
                                                            0
                                                        }{" "}
                                                        medicines
                                                    </span>

                                                </div>


                                                <Link
                                                    href={`/admin/orders/${orderId}`}
                                                    className={
                                                        styles.mobileManageButton
                                                    }
                                                >

                                                    Manage

                                                    <ArrowForwardRoundedIcon />

                                                </Link>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>


                        {/* =================================================
                            PAGINATION
                        ================================================== */}

                        {filteredOrders.length >
                            0 &&
                            totalPages > 1 && (

                                <div
                                    className={
                                        styles.paginationWrapper
                                    }
                                >

                                    <div
                                        className={
                                            styles.paginationInfo
                                        }
                                    >

                                        Showing{" "}

                                        {
                                            (page - 1) *
                                            ORDERS_PER_PAGE +
                                            1
                                        }

                                        {" - "}

                                        {
                                            Math.min(
                                                page *
                                                    ORDERS_PER_PAGE,
                                                filteredOrders.length
                                            )
                                        }

                                        {" of "}

                                        {
                                            filteredOrders.length
                                        }

                                    </div>


                                    <Pagination
                                        count={
                                            totalPages
                                        }
                                        page={
                                            page
                                        }
                                        onChange={
                                            handlePageChange
                                        }
                                        color="primary"
                                        shape="rounded"
                                        showFirstButton
                                        showLastButton
                                    />

                                </div>

                            )}


                        {/* =================================================
                            EMPTY
                        ================================================== */}

                        {filteredOrders.length ===
                            0 && (

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

                                    {orders.length ===
                                    0
                                        ? "There are no orders available."
                                        : "Try changing your search or filter options."}

                                </p>


                                <button
                                    type="button"
                                    onClick={
                                        resetFilters
                                    }
                                >
                                    Reset filters
                                </button>

                            </div>

                        )}

                    </section>

                </div>

            </main>


\
        </>
    );

}