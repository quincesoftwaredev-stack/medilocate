import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import axios from "axios";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import NavigationOutlinedIcon from "@mui/icons-material/NavigationOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";


import styles from "@/styles/Admin/Orders/OrderDetails.module.css";
import BASE_URL from "@/config";


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const statusMeta = {

    pending: {
        label: "Pending",
        className: "pending",
        icon: PendingOutlinedIcon,
    },

    preparing: {
        label: "Preparing",
        className: "preparing",
        icon: Inventory2OutlinedIcon,
    },

    ready: {
        label: "Ready for Delivery",
        className: "ready",
        icon: CheckCircleRoundedIcon,
    },

    assigned: {
        label: "Assigned",
        className: "assigned",
        icon: AssignmentIndOutlinedIcon,
    },

    out_for_delivery: {
        label: "Out for Delivery",
        className: "outForDelivery",
        icon: LocalShippingOutlinedIcon,
    },

    delivered: {
        label: "Delivered",
        className: "delivered",
        icon: CheckCircleRoundedIcon,
    },

    cancelled: {
        label: "Cancelled",
        className: "cancelled",
        icon: CancelOutlinedIcon,
    },

    failed: {
        label: "Failed",
        className: "failed",
        icon: ErrorOutlineRoundedIcon,
    },

};


/*
|--------------------------------------------------------------------------
| STATUS OPTIONS
|--------------------------------------------------------------------------
*/

const statusOptions = [

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
        label: "Ready for Delivery",
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
| HELPERS
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

    if (!date) {
        return "N/A";
    }

    return new Date(date).toLocaleString(
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


const formatMoney = (amount) => {

    return Number(amount || 0).toLocaleString(
        "en-BD"
    );

};


/*
|--------------------------------------------------------------------------
| TEMPORARY RIDERS
|--------------------------------------------------------------------------
*/

const riders = [

    {
        id: "r1",
        name: "Rahim Delivery",
        phone: "01798765432",
        activeOrders: 2,
        available: true,
    },

    {
        id: "r2",
        name: "Sakib Delivery",
        phone: "01898765432",
        activeOrders: 1,
        available: true,
    },

    {
        id: "r3",
        name: "Imran Delivery",
        phone: "01998765432",
        activeOrders: 3,
        available: false,
    },

];


/*
|--------------------------------------------------------------------------
| GET SERVER SIDE PROPS
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(context) {

    const {
        req,
        params,
    } = context;


    const cookies =
        req.headers.cookie || "";


    try {

        const response =
            await axios.get(

                `${BASE_URL}/api/orders/${params.id}`,

                {

                    headers: {

                        Cookie:
                            cookies,

                    },

                }

            );


        const order =
            response.data?.order ||
            response.data ||
            null;


        if (!order) {

            return {
                notFound: true,
            };

        }


        return {

            props: {

                order,

            },

        };

    } catch (error) {

        console.log(
            "ADMIN ORDER DETAILS SSR ERROR:",
            error.response?.data ||
            error.message
        );


        return {

            notFound: true,

        };

    }

}


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function OrderDetailsPage({
    order: initialOrder,
}) {

    const router =
        useRouter();


    /*
    |--------------------------------------------------------------------------
    | ORDER STATE
    |--------------------------------------------------------------------------
    */

    const [order, setOrder] =
        useState(initialOrder);


    /*
    |--------------------------------------------------------------------------
    | LOCAL STATE
    |--------------------------------------------------------------------------
    */

    const [status, setStatus] =
        useState(
            initialOrder?.status ||
            "pending"
        );


    const [selectedRider, setSelectedRider] =
        useState(
            initialOrder?.rider?._id ||
            initialOrder?.rider?.id ||
            ""
        );


    const [internalNote, setInternalNote] =
        useState(
            initialOrder?.internalNote ||
            ""
        );


    const [savingStatus, setSavingStatus] =
        useState(false);


    const [savingRider, setSavingRider] =
        useState(false);


    const [savingNote, setSavingNote] =
        useState(false);


    const [showCancelModal, setShowCancelModal] =
        useState(false);


    const [showFailModal, setShowFailModal] =
        useState(false);


    const [showEditItems, setShowEditItems] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | SYNC
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!initialOrder) {
            return;
        }


        setOrder(initialOrder);


        setStatus(
            initialOrder.status ||
            "pending"
        );


        setSelectedRider(
            initialOrder.rider?._id ||
            initialOrder.rider?.id ||
            ""
        );


        setInternalNote(
            initialOrder.internalNote ||
            ""
        );

    }, [
        initialOrder,
    ]);


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (!router.isReady) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | ORDER NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!order) {

        return (

            <>

                <Head>

                    <title>
                        Order Not Found | MediLocate Admin
                    </title>

                </Head>




                <main className={styles.notFound}>

                    <ShoppingBagOutlinedIcon />

                    <h1>
                        Order not found
                    </h1>

                    <p>
                        The order you're looking for
                        doesn't exist.
                    </p>


                    <Link
                        href="/admin/orders"
                    >

                        <ArrowBackRoundedIcon />

                        Back to Orders

                    </Link>

                </main>


                <Footer />

            </>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | ORDER ID / TRACKING NUMBER
    |--------------------------------------------------------------------------
    */

    const orderId =
        order._id ||
        order.id;


    const trackingNumber =
        order.trackingNumber ||
        order.orderCode ||
        orderId;


    /*
    |--------------------------------------------------------------------------
    | ITEMS
    |--------------------------------------------------------------------------
    */

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    /*
    |--------------------------------------------------------------------------
    | SUBTOTAL
    |--------------------------------------------------------------------------
    |
    | The API already provides subtotal.
    | We use it first and calculate only as fallback.
    |
    */

    const calculatedSubtotal =
        items.reduce(

            (
                total,
                item
            ) => {

                const unitPrice =
                    Number(
                        item.unitPrice ||
                        item.medicine?.price ||
                        0
                    );


                const quantity =
                    Number(
                        item.quantity ||
                        0
                    );


                return (
                    total +
                    unitPrice *
                    quantity
                );

            },

            0

        );


    const subtotal =
        Number.isFinite(
            Number(order.subtotal)
        )
            ? Number(order.subtotal)
            : calculatedSubtotal;


    /*
    |--------------------------------------------------------------------------
    | DELIVERY FEE
    |--------------------------------------------------------------------------
    */

    const deliveryFee =
        Number(
            order.deliveryFee ||
            0
        );


    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    const total =
        Number.isFinite(
            Number(order.total)
        )
            ? Number(order.total)
            : subtotal +
            deliveryFee;


    /*
    |--------------------------------------------------------------------------
    | TOTAL ITEMS
    |--------------------------------------------------------------------------
    */

    const totalItems =
        items.reduce(

            (
                total,
                item
            ) =>

                total +
                Number(
                    item.quantity ||
                    0
                ),

            0

        );


    /*
    |--------------------------------------------------------------------------
    | CURRENT STATUS
    |--------------------------------------------------------------------------
    */

    const currentStatus =
        statusMeta[status] ||
        statusMeta.pending;


    const StatusIcon =
        currentStatus.icon;


    /*
    |--------------------------------------------------------------------------
    | DELIVERY DATA
    |--------------------------------------------------------------------------
    */

    const delivery =
        order.delivery || {};


    const customerName =
        delivery.name ||
        "N/A";


    const customerPhone =
        delivery.phone ||
        "N/A";


    const customerAddress =
        delivery.address ||
        "N/A";


    const customerCity =
        delivery.city ||
        "";


    /*
    |--------------------------------------------------------------------------
    | PAYMENT DATA
    |--------------------------------------------------------------------------
    */

    const paymentMethod =
        order.paymentMethod === "cod"
            ? "Cash on Delivery"
            : order.paymentMethod ||
            "Online";


    const paymentStatus =
        order.paymentStatus ||
        "pending";


    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = async (
        nextStatus
    ) => {

        if (
            nextStatus ===
            "cancelled"
        ) {

            setShowCancelModal(true);

            return;

        }


        if (
            nextStatus ===
            "failed"
        ) {

            setShowFailModal(true);

            return;

        }


        try {

            setSavingStatus(true);


            const response =
                await axios.patch(

                    `${BASE_URL}/api/admin/orders/${orderId}/status`,

                    {
                        status:
                            nextStatus,
                    }

                );


            const updatedOrder =
                response.data?.order;


            if (updatedOrder) {

                setOrder(
                    updatedOrder
                );


                setStatus(
                    updatedOrder.status ||
                    nextStatus
                );

            } else {

                setStatus(
                    nextStatus
                );

            }

        } catch (error) {

            console.log(
                "UPDATE ORDER STATUS ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to update order status."
            );


            setStatus(
                order.status ||
                "pending"
            );

        } finally {

            setSavingStatus(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | ASSIGN RIDER
    |--------------------------------------------------------------------------
    */

    const handleAssignRider = async () => {

        if (!selectedRider) {

            alert(
                "Please select a delivery rider."
            );

            return;

        }


        try {

            setSavingRider(true);


            const response =
                await axios.patch(

                    `${BASE_URL}/api/admin/orders/${orderId}/assign-rider`,

                    {
                        riderId:
                            selectedRider,
                    }

                );


            const updatedOrder =
                response.data?.order;


            if (updatedOrder) {

                setOrder(
                    updatedOrder
                );


                setStatus(
                    updatedOrder.status ||
                    "assigned"
                );

            } else {

                setStatus(
                    "assigned"
                );

            }


            alert(
                "Rider assigned successfully."
            );

        } catch (error) {

            console.log(
                "ASSIGN RIDER ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to assign rider."
            );

        } finally {

            setSavingRider(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CANCEL ORDER
    |--------------------------------------------------------------------------
    */

    const confirmCancel = async () => {

        try {

            setSavingStatus(true);


            const response =
                await axios.patch(

                    `${BASE_URL}/api/admin/orders/${orderId}/status`,

                    {
                        status:
                            "cancelled",
                    }

                );


            const updatedOrder =
                response.data?.order;


            setStatus(
                "cancelled"
            );


            if (updatedOrder) {

                setOrder(
                    updatedOrder
                );

            }


            setShowCancelModal(
                false
            );

        } catch (error) {

            console.log(
                "CANCEL ORDER ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to cancel order."
            );

        } finally {

            setSavingStatus(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | FAILED ORDER
    |--------------------------------------------------------------------------
    */

    const confirmFailed = async () => {

        try {

            setSavingStatus(true);


            const response =
                await axios.patch(

                    `${BASE_URL}/api/admin/orders/${orderId}/status`,

                    {
                        status:
                            "failed",
                    }

                );


            const updatedOrder =
                response.data?.order;


            setStatus(
                "failed"
            );


            if (updatedOrder) {

                setOrder(
                    updatedOrder
                );

            }


            setShowFailModal(
                false
            );

        } catch (error) {

            console.log(
                "FAILED ORDER ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to update order."
            );

        } finally {

            setSavingStatus(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE INTERNAL NOTE
    |--------------------------------------------------------------------------
    */

    const saveInternalNote = async () => {

        try {

            setSavingNote(true);


            const response =
                await axios.patch(

                    `${BASE_URL}/api/admin/orders/${orderId}`,

                    {
                        internalNote,
                    }

                );


            const updatedOrder =
                response.data?.order;


            if (updatedOrder) {

                setOrder(
                    updatedOrder
                );


                setInternalNote(
                    updatedOrder.internalNote ||
                    ""
                );

            }


            alert(
                "Internal note saved."
            );

        } catch (error) {

            console.log(
                "SAVE INTERNAL NOTE ERROR:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to save internal note."
            );

        } finally {

            setSavingNote(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN LOCATION
    |--------------------------------------------------------------------------
    */

    const openLocation = () => {

        if (
            !customerAddress ||
            customerAddress === "N/A"
        ) {

            alert(
                "Delivery address is not available."
            );

            return;

        }


        const query =
            [
                customerAddress,
                customerCity,
            ]
                .filter(Boolean)
                .join(", ");


        const url =
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                query
            )}`;


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    };


    /*
    |--------------------------------------------------------------------------
    | SOURCE
    |--------------------------------------------------------------------------
    */

    const source =
        order.prescription
            ? "Prescription Order"
            : "Cart Order";


    return (

        <>

            <Head>

                <title>

                    {trackingNumber}

                    {" | Order Management"}

                </title>

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        TOP NAV
                    ====================================================== */}

                    <div className={styles.topNav}>

                        <Link
                            href="/admin/orders"
                            className={styles.backLink}
                        >

                            <ArrowBackRoundedIcon />

                            Orders

                        </Link>


                        <span className={styles.separator}>
                            /
                        </span>


                        <strong>
                            {trackingNumber}
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.header}>

                        <div>

                            <div
                                className={
                                    styles.headerCode
                                }
                            >

                                <ShoppingBagOutlinedIcon />

                                <span>
                                    {trackingNumber}
                                </span>

                            </div>


                            <h1>
                                Order details
                            </h1>


                            <p>

                                Created on{" "}

                                {
                                    formatDate(
                                        order.createdAt
                                    )
                                }

                            </p>

                        </div>


                        <div
                            className={
                                styles.headerStatus
                            }
                        >

                            <span
                                className={`${styles.statusBadge} ${styles[currentStatus.className]}`}
                            >

                                <StatusIcon />

                                {
                                    currentStatus.label
                                }

                            </span>


                            <span
                                className={
                                    styles.cartSource
                                }
                            >

                                {source}

                            </span>

                        </div>

                    </header>


                    {/* =====================================================
                        STATUS CONTROL
                    ====================================================== */}

                    <section
                        className={
                            styles.statusCard
                        }
                    >

                        <div>

                            <span>
                                ORDER STATUS
                            </span>

                            <strong>
                                {
                                    currentStatus.label
                                }
                            </strong>

                        </div>


                        <div
                            className={
                                styles.statusControl
                            }
                        >

                            <select
                                value={status}
                                onChange={(event) =>
                                    handleStatusChange(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    savingStatus
                                }
                            >

                                {
                                    statusOptions.map(
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
                                    )
                                }

                            </select>

                        </div>

                    </section>


                    {/* =====================================================
                        MAIN GRID
                    ====================================================== */}

                    <div className={styles.mainGrid}>


                        {/* =================================================
                            LEFT COLUMN
                        ================================================== */}

                        <div className={styles.mainColumn}>


                            {/* =============================================
                                CUSTOMER
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTitle
                                        }
                                    >

                                        <PersonOutlineRoundedIcon />

                                        <div>

                                            <h2>
                                                Customer information
                                            </h2>

                                            <span>
                                                Delivery details
                                            </span>

                                        </div>

                                    </div>


                                    <a
                                        href={
                                            customerPhone !== "N/A"
                                                ? `tel:${customerPhone}`
                                                : undefined
                                        }
                                        className={
                                            styles.callButton
                                        }
                                    >

                                        <PhoneOutlinedIcon />

                                        Call

                                    </a>

                                </div>


                                <div
                                    className={
                                        styles.patientGrid
                                    }
                                >

                                    <div>

                                        <span>
                                            Customer
                                        </span>

                                        <strong>
                                            {customerName}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {customerPhone}
                                        </strong>

                                    </div>


                                    <div
                                        className={
                                            styles.addressCell
                                        }
                                    >

                                        <span>
                                            Delivery address
                                        </span>

                                        <strong>
                                            {customerAddress}
                                        </strong>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.addressActions
                                    }
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            openLocation
                                        }
                                    >

                                        <NavigationOutlinedIcon />

                                        Open location

                                    </button>

                                </div>

                            </section>


                            {/* =============================================
                                MEDICINES
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTitle
                                        }
                                    >

                                        <ShoppingBagOutlinedIcon />

                                        <div>

                                            <h2>
                                                Order items
                                            </h2>

                                            <span>
                                                {
                                                    totalItems
                                                }{" "}
                                                units
                                            </span>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        className={
                                            styles.editButton
                                        }
                                        onClick={() =>
                                            setShowEditItems(
                                                !showEditItems
                                            )
                                        }
                                    >

                                        <EditOutlinedIcon />

                                        {
                                            showEditItems
                                                ? "Done"
                                                : "Edit"
                                        }

                                    </button>

                                </div>


                                <div
                                    className={
                                        styles.itemsList
                                    }
                                >

                                    {
                                        items.length > 0
                                            ? (

                                                items.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {

                                                        const medicine =
                                                            item.medicine ||
                                                            {};


                                                        const unitPrice =
                                                            Number(
                                                                item.unitPrice ||
                                                                medicine.price ||
                                                                0
                                                            );


                                                        const quantity =
                                                            Number(
                                                                item.quantity ||
                                                                0
                                                            );


                                                        const itemTotal =
                                                            unitPrice *
                                                            quantity;


                                                        return (

                                                            <div
                                                                key={
                                                                    item._id ||
                                                                    medicine._id ||
                                                                    index
                                                                }
                                                                className={
                                                                    styles.orderItem
                                                                }
                                                            >

                                                                <div
                                                                    className={
                                                                        styles.itemImage
                                                                    }
                                                                >

                                                                    {
                                                                        medicine.image?.url
                                                                            ? (
                                                                                <img
                                                                                    src={
                                                                                        medicine.image.url
                                                                                    }
                                                                                    alt={
                                                                                        medicine.name ||
                                                                                        "Medicine"
                                                                                    }
                                                                                />
                                                                            )
                                                                            : (
                                                                                <DescriptionOutlinedIcon />
                                                                            )
                                                                    }

                                                                </div>


                                                                <div
                                                                    className={
                                                                        styles.itemInfo
                                                                    }
                                                                >

                                                                    <strong>
                                                                        {
                                                                            medicine.name ||
                                                                            "Medicine"
                                                                        }
                                                                    </strong>


                                                                    <span>

                                                                        {
                                                                            medicine.genericName ||
                                                                            "N/A"
                                                                        }

                                                                        {" • "}

                                                                        {
                                                                            medicine.strength ||
                                                                            ""
                                                                        }

                                                                    </span>


                                                                    <small>

                                                                        {
                                                                            medicine.dosageForm ||
                                                                            ""
                                                                        }

                                                                        {
                                                                            medicine.packSize
                                                                                ? ` • ${medicine.packSize}`
                                                                                : ""
                                                                        }

                                                                    </small>

                                                                </div>


                                                                <div
                                                                    className={
                                                                        styles.itemQuantity
                                                                    }
                                                                >

                                                                    <span>
                                                                        Qty
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            quantity
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <div
                                                                    className={
                                                                        styles.itemPrice
                                                                    }
                                                                >

                                                                    <span>

                                                                        ৳
                                                                        {
                                                                            formatMoney(
                                                                                unitPrice
                                                                            )
                                                                        }

                                                                        {" × "}

                                                                        {
                                                                            quantity
                                                                        }

                                                                    </span>


                                                                    <strong>

                                                                        ৳
                                                                        {
                                                                            formatMoney(
                                                                                itemTotal
                                                                            )
                                                                        }

                                                                    </strong>

                                                                </div>

                                                            </div>

                                                        );

                                                    }
                                                )

                                            )
                                            : (

                                                <div
                                                    className={
                                                        styles.emptyState
                                                    }
                                                >

                                                    <ShoppingBagOutlinedIcon />

                                                    <p>
                                                        No medicine items found.
                                                    </p>

                                                </div>

                                            )
                                    }

                                </div>


                                {showEditItems && (

                                    <div
                                        className={
                                            styles.editNotice
                                        }
                                    >

                                        <EditOutlinedIcon />

                                        <span>
                                            Item editing UI will be
                                            connected to the medicine
                                            catalog here.
                                        </span>

                                    </div>

                                )}

                            </section>


                            {/* =============================================
                                PRESCRIPTION
                            ============================================== */}

                            {order.prescription && (

                                <section
                                    className={
                                        styles.card
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardHeader
                                        }
                                    >

                                        <div
                                            className={
                                                styles.cardTitle
                                            }
                                        >

                                            <DescriptionOutlinedIcon />

                                            <div>

                                                <h2>
                                                    Prescription
                                                </h2>

                                                <span>
                                                    Source of this order
                                                </span>

                                            </div>

                                        </div>


                                        <Link
                                            href={`/admin/prescriptions/${order.prescription.requestCode || order.requestCode || orderId}`}
                                            className={
                                                styles.viewPrescription
                                            }
                                        >

                                            View Request

                                            <ArrowForwardRoundedIcon />

                                        </Link>

                                    </div>


                                    <div
                                        className={
                                            styles.prescriptionInfo
                                        }
                                    >

                                        <div>

                                            <span>
                                                Request ID
                                            </span>

                                            <strong>
                                                {
                                                    order.prescription.requestCode ||
                                                    order.requestCode ||
                                                    "N/A"
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Pages
                                            </span>

                                            <strong>
                                                {
                                                    order.prescription.pages ||
                                                    "N/A"
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>

                            )}


                            {/* =============================================
                                PATIENT NOTE
                            ============================================== */}

                            {order.notes && (

                                <section
                                    className={
                                        styles.noteCard
                                    }
                                >

                                    <WarningAmberRoundedIcon />

                                    <div>

                                        <span>
                                            Customer instruction
                                        </span>

                                        <p>
                                            {order.notes}
                                        </p>

                                    </div>

                                </section>

                            )}

                        </div>


                        {/* =================================================
                            RIGHT COLUMN
                        ================================================== */}

                        <aside className={styles.sidebar}>


                            {/* =============================================
                                PAYMENT
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <PaymentsOutlinedIcon />

                                    <div>

                                        <h2>
                                            Payment summary
                                        </h2>

                                        <span>
                                            Order amount
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.summaryRows
                                    }
                                >

                                    <div>

                                        <span>
                                            Medicines
                                        </span>

                                        <strong>
                                            ৳
                                            {
                                                formatMoney(
                                                    subtotal
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Delivery fee
                                        </span>

                                        <strong>

                                            {
                                                deliveryFee === 0
                                                    ? "FREE"
                                                    : `৳${formatMoney(
                                                        deliveryFee
                                                    )}`
                                            }

                                        </strong>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.totalRow
                                    }
                                >

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ৳
                                        {
                                            formatMoney(
                                                total
                                            )
                                        }
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.paymentMeta
                                    }
                                >

                                    <div>

                                        <span>
                                            Payment method
                                        </span>

                                        <strong>
                                            {paymentMethod}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Payment status
                                        </span>

                                        <strong
                                            className={
                                                paymentStatus ===
                                                    "paid"
                                                    ? styles.paid
                                                    : styles.unpaid
                                            }
                                        >

                                            {
                                                paymentStatus ===
                                                    "paid"
                                                    ? "Paid"
                                                    : "Pending"
                                            }

                                        </strong>

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                DELIVERY
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <LocalShippingOutlinedIcon />

                                    <div>

                                        <h2>
                                            Delivery
                                        </h2>

                                        <span>
                                            Delivery assignment
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.deliveryAddress
                                    }
                                >

                                    <LocationOnOutlinedIcon />

                                    <div>

                                        <span>
                                            Deliver to
                                        </span>

                                        <strong>
                                            {customerAddress}
                                        </strong>

                                    </div>

                                </div>


                                {order.rider ? (

                                    <div
                                        className={
                                            styles.currentRider
                                        }
                                    >

                                        <div
                                            className={
                                                styles.riderAvatar
                                            }
                                        >

                                            {
                                                order.rider.name?.charAt(
                                                    0
                                                )
                                            }

                                        </div>


                                        <div>

                                            <span>
                                                Assigned rider
                                            </span>

                                            <strong>
                                                {
                                                    order.rider.name
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    order.rider.phone
                                                }
                                            </small>

                                        </div>

                                    </div>

                                ) : (

                                    <div
                                        className={
                                            styles.noRider
                                        }
                                    >

                                        <AssignmentIndOutlinedIcon />

                                        <span>
                                            No rider assigned
                                        </span>

                                    </div>

                                )}


                                <div
                                    className={
                                        styles.riderSelect
                                    }
                                >

                                    <label>
                                        Assign rider
                                    </label>


                                    <select
                                        value={
                                            selectedRider
                                        }
                                        onChange={(event) =>
                                            setSelectedRider(
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select a rider
                                        </option>


                                        {
                                            riders.map(
                                                (rider) => (

                                                    <option
                                                        key={
                                                            rider.id
                                                        }
                                                        value={
                                                            rider.id
                                                        }
                                                        disabled={
                                                            !rider.available
                                                        }
                                                    >

                                                        {
                                                            rider.name
                                                        }

                                                        {" — "}

                                                        {
                                                            rider.available
                                                                ? "Available"
                                                                : "Busy"
                                                        }

                                                    </option>

                                                )
                                            )
                                        }

                                    </select>


                                    <button
                                        type="button"
                                        onClick={
                                            handleAssignRider
                                        }
                                        disabled={
                                            !selectedRider ||
                                            savingRider
                                        }
                                    >

                                        <AssignmentIndOutlinedIcon />

                                        {
                                            savingRider
                                                ? "Assigning..."
                                                : "Assign Rider"
                                        }

                                    </button>

                                </div>

                            </section>


                            {/* =============================================
                                QUICK ACTIONS
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <h2
                                    className={
                                        styles.quickTitle
                                    }
                                >
                                    Quick actions
                                </h2>


                                <div
                                    className={
                                        styles.quickActions
                                    }
                                >

                                    <a
                                        href={
                                            customerPhone !== "N/A"
                                                ? `tel:${customerPhone}`
                                                : undefined
                                        }
                                    >

                                        <PhoneOutlinedIcon />

                                        Call Customer

                                    </a>


                                    <button
                                        type="button"
                                        onClick={
                                            openLocation
                                        }
                                    >

                                        <NavigationOutlinedIcon />

                                        Open Address

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCancelModal(
                                                true
                                            )
                                        }
                                    >

                                        <CancelOutlinedIcon />

                                        Cancel Order

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowFailModal(
                                                true
                                            )
                                        }
                                    >

                                        <ErrorOutlineRoundedIcon />

                                        Mark Failed

                                    </button>

                                </div>

                            </section>


                            {/* =============================================
                                INTERNAL NOTE
                            ============================================== */}

                            <section
                                className={
                                    styles.card
                                }
                            >

                                <div
                                    className={
                                        styles.cardTitle
                                    }
                                >

                                    <EditOutlinedIcon />

                                    <div>

                                        <h2>
                                            Internal note
                                        </h2>

                                        <span>
                                            Visible to admins only
                                        </span>

                                    </div>

                                </div>


                                <textarea
                                    className={
                                        styles.internalNote
                                    }
                                    value={
                                        internalNote
                                    }
                                    onChange={(event) =>
                                        setInternalNote(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Add an internal note..."
                                    rows={4}
                                />


                                <button
                                    type="button"
                                    className={
                                        styles.saveNoteButton
                                    }
                                    onClick={
                                        saveInternalNote
                                    }
                                    disabled={
                                        savingNote
                                    }
                                >

                                    {
                                        savingNote
                                            ? "Saving..."
                                            : "Save note"
                                    }

                                </button>

                            </section>

                        </aside>

                    </div>

                </div>

            </main>


            {/* =====================================================
                CANCEL MODAL
            ====================================================== */}

            {showCancelModal && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setShowCancelModal(
                            false
                        )
                    }
                >

                    <div
                        className={
                            styles.modal
                        }
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.modalClose
                            }
                            onClick={() =>
                                setShowCancelModal(
                                    false
                                )
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.modalIconDanger
                            }
                        >

                            <CancelOutlinedIcon />

                        </div>


                        <h2>
                            Cancel this order?
                        </h2>


                        <p>

                            This will mark{" "}

                            {
                                trackingNumber
                            }

                            {" "}as cancelled. This action should
                            only be used when the order will
                            not be fulfilled.

                        </p>


                        <textarea
                            className={
                                styles.modalTextarea
                            }
                            placeholder="Cancellation reason..."
                            rows={3}
                        />


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCancelModal(
                                        false
                                    )
                                }
                                className={
                                    styles.secondaryButton
                                }
                            >
                                Keep Order
                            </button>


                            <button
                                type="button"
                                onClick={
                                    confirmCancel
                                }
                                className={
                                    styles.dangerButton
                                }
                                disabled={
                                    savingStatus
                                }
                            >

                                {
                                    savingStatus
                                        ? "Cancelling..."
                                        : "Cancel Order"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                FAILED MODAL
            ====================================================== */}

            {showFailModal && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setShowFailModal(
                            false
                        )
                    }
                >

                    <div
                        className={
                            styles.modal
                        }
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.modalClose
                            }
                            onClick={() =>
                                setShowFailModal(
                                    false
                                )
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.modalIconWarning
                            }
                        >

                            <ErrorOutlineRoundedIcon />

                        </div>


                        <h2>
                            Mark order as failed?
                        </h2>


                        <p>
                            Use this when the order could not
                            be successfully processed or
                            delivered.
                        </p>


                        <textarea
                            className={
                                styles.modalTextarea
                            }
                            placeholder="Failure reason..."
                            rows={3}
                        />


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowFailModal(
                                        false
                                    )
                                }
                                className={
                                    styles.secondaryButton
                                }
                            >
                                Go Back
                            </button>


                            <button
                                type="button"
                                onClick={
                                    confirmFailed
                                }
                                className={
                                    styles.warningButton
                                }
                                disabled={
                                    savingStatus
                                }
                            >

                                {
                                    savingStatus
                                        ? "Updating..."
                                        : "Mark Failed"
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}



        </>

    );

}