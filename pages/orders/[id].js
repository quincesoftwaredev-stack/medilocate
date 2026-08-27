import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Orders/OrderTracking.module.css";


/*
|--------------------------------------------------------------------------
| TRACKING STEPS
|--------------------------------------------------------------------------
*/

const trackingSteps = [

    {
        key: "pending",
        title: "Order placed",
        description:
            "Your order has been received.",
        icon: PendingOutlinedIcon,
    },

    {
        key: "preparing",
        title: "Preparing medicines",
        description:
            "Your medicines are being prepared.",
        icon: Inventory2OutlinedIcon,
    },

    {
        key: "ready",
        title: "Ready for delivery",
        description:
            "Your order is ready to leave the pharmacy.",
        icon: CheckCircleRoundedIcon,
    },

    {
        key: "assigned",
        title: "Rider assigned",
        description:
            "A delivery rider has been assigned.",
        icon: AssignmentIndOutlinedIcon,
    },

    {
        key: "out_for_delivery",
        title: "Out for delivery",
        description:
            "Your order is on the way.",
        icon: LocalShippingOutlinedIcon,
    },

    {
        key: "delivered",
        title: "Delivered",
        description:
            "Your order has been delivered.",
        icon: CheckCircleRoundedIcon,
    },

];


const statusOrder = [

    "pending",
    "preparing",
    "ready",
    "assigned",
    "out_for_delivery",
    "delivered",

];


const getStepState = (
    stepKey,
    currentStatus
) => {

    const currentIndex =
        statusOrder.indexOf(
            currentStatus
        );

    const stepIndex =
        statusOrder.indexOf(
            stepKey
        );


    if (
        currentStatus ===
        "cancelled"
    ) {

        return "cancelled";

    }


    if (
        currentStatus ===
        "failed"
    ) {

        return "failed";

    }


    if (
        stepIndex <
        currentIndex
    ) {

        return "completed";

    }


    if (
        stepIndex ===
        currentIndex
    ) {

        return "current";

    }


    return "upcoming";

};


/*
|--------------------------------------------------------------------------
| STATUS META
|--------------------------------------------------------------------------
*/

const getCurrentStatusMeta = (
    status
) => {

    switch (status) {

        case "pending":

            return {
                label:
                    "Order placed",
                className:
                    "pending",
                icon:
                    PendingOutlinedIcon,
            };


        case "preparing":

            return {
                label:
                    "Preparing your order",
                className:
                    "preparing",
                icon:
                    Inventory2OutlinedIcon,
            };


        case "ready":

            return {
                label:
                    "Ready for delivery",
                className:
                    "ready",
                icon:
                    CheckCircleRoundedIcon,
            };


        case "assigned":

            return {
                label:
                    "Rider assigned",
                className:
                    "assigned",
                icon:
                    AssignmentIndOutlinedIcon,
            };


        case "out_for_delivery":

            return {
                label:
                    "Out for delivery",
                className:
                    "outForDelivery",
                icon:
                    LocalShippingOutlinedIcon,
            };


        case "delivered":

            return {
                label:
                    "Delivered",
                className:
                    "delivered",
                icon:
                    CheckCircleRoundedIcon,
            };


        case "cancelled":

            return {
                label:
                    "Order cancelled",
                className:
                    "cancelled",
                icon:
                    CancelOutlinedIcon,
            };


        case "failed":

            return {
                label:
                    "Order failed",
                className:
                    "failed",
                icon:
                    ErrorOutlineRoundedIcon,
            };


        default:

            return {
                label:
                    "Order status",
                className:
                    "pending",
                icon:
                    PendingOutlinedIcon,
            };

    }

};


/*
|--------------------------------------------------------------------------
| GET SERVER SIDE PROPS
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    const {
        params,
        req
    } = context;


    const {
        id
    } = params;


    try {

        /*
        |--------------------------------------------------------------------------
        | BASE URL
        |--------------------------------------------------------------------------
        */

        const protocol =
            req.headers["x-forwarded-proto"] ||
            "http";


        const host =
            req.headers.host;


        const baseUrl =
            `${protocol}://${host}`;


        /*
        |--------------------------------------------------------------------------
        | FETCH ORDER
        |--------------------------------------------------------------------------
        */

        const response =
            await fetch(
                `${baseUrl}/api/orders/${id}`,
                {
                    headers: {
                        cookie:
                            req.headers.cookie ||
                            "",
                    },
                }
            );


        /*
        |--------------------------------------------------------------------------
        | ORDER NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (
            response.status ===
            404
        ) {

            return {
                notFound:
                    true,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | OTHER API ERROR
        |--------------------------------------------------------------------------
        */

        if (
            !response.ok
        ) {

            throw new Error(
                "Failed to fetch order"
            );

        }


        const order =
            await response.json();


        /*
        |--------------------------------------------------------------------------
        | RETURN ORDER
        |--------------------------------------------------------------------------
        */

        return {

            props: {

                order,

            },

        };

    } catch (error) {

        console.log(
            "Order fetch error:",
            error
        );


        return {

            notFound:
                true,

        };

    }

}


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function OrderTrackingPage({
    order
}) {


    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const statusMeta =
        getCurrentStatusMeta(
            order.status
        );


    const StatusIcon =
        statusMeta.icon;


    const isTerminal =
        order.status ===
        "cancelled" ||
        order.status ===
        "failed";


    /*
    |--------------------------------------------------------------------------
    | TOTAL ITEMS
    |--------------------------------------------------------------------------
    */

    const totalItems =
        (order.items || [])
            .reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    Number(
                        item.quantity || 0
                    ),
                0
            );


    /*
    |--------------------------------------------------------------------------
    | ORDER VALUES
    |--------------------------------------------------------------------------
    */

    const orderCode =
        order.orderCode ||
        order.code ||
        order._id;


    const createdAt =
        order.createdAt
            ? new Date(
                order.createdAt
            ).toLocaleString(
                "en-BD",
                {
                    day:
                        "2-digit",
                    month:
                        "short",
                    year:
                        "numeric",
                    hour:
                        "numeric",
                    minute:
                        "2-digit",
                    hour12:
                        true,
                }
            )
            : "N/A";


    const estimatedDelivery =
        order.estimatedDelivery ||
        null;


    /*
    |--------------------------------------------------------------------------
    | PATIENT / DELIVERY
    |--------------------------------------------------------------------------
    */

    const patient =
        order.patient ||
        order.customer ||
        order.deliveryAddress ||
        {};


    const patientName =
        patient.name ||
        order.name ||
        "Customer";


    const patientPhone =
        patient.phone ||
        order.phone ||
        "";


    const patientAddress =
        patient.address ||
        patient.formattedAddress ||
        order.address ||
        "Delivery address not available";


    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    const payment =
        order.payment ||
        {};


    const paymentMethod =
        payment.method ||
        order.paymentMethod ||
        "Cash on Delivery";


    const paymentStatus =
        payment.status ||
        order.paymentStatus ||
        "pending";


    /*
    |--------------------------------------------------------------------------
    | TOTALS
    |--------------------------------------------------------------------------
    */

    const subtotal =
        Number(
            order.subtotal ??
            order.medicineTotal ??
            0
        );


    const deliveryFee =
        Number(
            order.deliveryFee ??
            0
        );


    const total =
        Number(
            order.total ??
            subtotal +
            deliveryFee
        );


    /*
    |--------------------------------------------------------------------------
    | RIDER
    |--------------------------------------------------------------------------
    */

    const rider =
        order.rider ||
        order.deliveryRider ||
        null;


    return (

        <>

            <Head>

                <title>
                    {orderCode} | MediLocate
                </title>

                <meta
                    name="description"
                    content={`Track your MediLocate medicine order ${orderCode}.`}
                />

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        BREADCRUMB
                    ====================================================== */}

                    <div className={styles.breadcrumb}>

                        <Link href="/orders">

                            <ArrowBackRoundedIcon />

                            My Orders

                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            {order.trackingNumber}
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header className={styles.header}>

                        <div>

                            <span className={styles.eyebrow}>
                                ORDER TRACKING
                            </span>

                            <h1>
                                {order.trackingNumber}
                            </h1>

                            <p>
                                Placed on {createdAt}
                            </p>

                        </div>


                        <span
                            className={`${styles.statusBadge} ${styles[statusMeta.className]}`}
                        >

                            <StatusIcon />

                            {statusMeta.label}

                        </span>

                    </header>


                    {/* =====================================================
                        CURRENT STATUS HERO
                    ====================================================== */}

                    <section
                        className={`${styles.currentStatus} ${styles[statusMeta.className]
                            }`}
                    >

                        <div
                            className={
                                styles.currentStatusIcon
                            }
                        >

                            <StatusIcon />

                        </div>


                        <div
                            className={
                                styles.currentStatusContent
                            }
                        >

                            <span>
                                CURRENT STATUS
                            </span>

                            <h2>
                                {statusMeta.label}
                            </h2>


                            {order.status ===
                                "out_for_delivery" && (

                                    <p>

                                        Your order is on the way.
                                        Estimated delivery:

                                        {" "}

                                        <strong>
                                            {estimatedDelivery ||
                                                "Soon"}
                                        </strong>

                                    </p>

                                )}


                            {order.status ===
                                "preparing" && (

                                    <p>

                                        The pharmacy is preparing
                                        your medicines right now.

                                    </p>

                                )}


                            {order.status ===
                                "pending" && (

                                    <p>

                                        We've received your order
                                        and will start preparing it
                                        shortly.

                                    </p>

                                )}


                            {order.status ===
                                "ready" && (

                                    <p>

                                        Your medicines are ready and
                                        waiting for delivery.

                                    </p>

                                )}


                            {order.status ===
                                "assigned" && (

                                    <p>

                                        A delivery rider has been
                                        assigned to your order.

                                    </p>

                                )}


                            {order.status ===
                                "delivered" && (

                                    <p>

                                        Your order has been
                                        successfully delivered.

                                    </p>

                                )}


                            {order.status ===
                                "cancelled" && (

                                    <p>

                                        This order has been
                                        cancelled.

                                    </p>

                                )}


                            {order.status ===
                                "failed" && (

                                    <p>

                                        We were unable to complete
                                        this order.

                                    </p>

                                )}

                        </div>


                        {order.status ===
                            "out_for_delivery" && (

                                <div
                                    className={
                                        styles.eta
                                    }
                                >

                                    <AccessTimeOutlinedIcon />

                                    <div>

                                        <span>
                                            Estimated delivery
                                        </span>

                                        <strong>
                                            {estimatedDelivery ||
                                                "Today"}
                                        </strong>

                                    </div>

                                </div>

                            )}

                    </section>


                    {/* =====================================================
                        MAIN GRID
                    ====================================================== */}

                    <div className={styles.mainGrid}>


                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div className={styles.mainColumn}>


                            {/* =============================================
                                TIMELINE
                            ============================================== */}

                            {!isTerminal && (

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

                                            <LocalShippingOutlinedIcon />

                                            <div>

                                                <h2>
                                                    Order progress
                                                </h2>

                                                <span>
                                                    Follow your delivery
                                                    status
                                                </span>

                                            </div>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.timeline
                                        }
                                    >

                                        {trackingSteps.map(
                                            (step) => {

                                                const state =
                                                    getStepState(
                                                        step.key,
                                                        order.status
                                                    );


                                                const StepIcon =
                                                    step.icon;


                                                return (

                                                    <div
                                                        key={
                                                            step.key
                                                        }
                                                        className={`${styles.timelineItem} ${styles[state]
                                                            }`}
                                                    >

                                                        <div
                                                            className={
                                                                styles.timelineIcon
                                                            }
                                                        >

                                                            {state ===
                                                                "completed" ? (

                                                                <CheckCircleRoundedIcon />

                                                            ) : (

                                                                <StepIcon />

                                                            )}

                                                        </div>


                                                        <div
                                                            className={
                                                                styles.timelineContent
                                                            }
                                                        >

                                                            <strong>
                                                                {
                                                                    step.title
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    step.description
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                </section>

                            )}


                            {/* =============================================
                                RIDER
                            ============================================== */}

                            {rider &&
                                order.status !==
                                "delivered" &&
                                order.status !==
                                "cancelled" &&
                                order.status !==
                                "failed" && (

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

                                                <LocalShippingOutlinedIcon />

                                                <div>

                                                    <h2>
                                                        Your delivery rider
                                                    </h2>

                                                    <span>
                                                        Your order is on the way
                                                    </span>

                                                </div>

                                            </div>

                                        </div>


                                        <div
                                            className={
                                                styles.riderCard
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.riderAvatar
                                                }
                                            >

                                                {(
                                                    rider.name ||
                                                    "R"
                                                ).charAt(0)}

                                            </div>


                                            <div
                                                className={
                                                    styles.riderInfo
                                                }
                                            >

                                                <strong>
                                                    {rider.name}
                                                </strong>

                                                <span>
                                                    Delivery Rider
                                                </span>

                                                <small>
                                                    {rider.phone}
                                                </small>

                                            </div>


                                            {rider.phone && (

                                                <a
                                                    href={`tel:${rider.phone}`}
                                                    className={
                                                        styles.callRider
                                                    }
                                                >

                                                    <PhoneOutlinedIcon />

                                                    Call

                                                </a>

                                            )}

                                        </div>

                                    </section>

                                )}


                            {/* =============================================
                                DELIVERY ADDRESS
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

                                        <LocationOnOutlinedIcon />

                                        <div>

                                            <h2>
                                                Delivery address
                                            </h2>

                                            <span>
                                                Where your order will arrive
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.address
                                    }
                                >

                                    <div
                                        className={
                                            styles.addressIcon
                                        }
                                    >

                                        <LocationOnOutlinedIcon />

                                    </div>


                                    <div>

                                        <strong>
                                            {patientName}
                                        </strong>

                                        <span>
                                            {patientAddress}
                                        </span>

                                        {patientPhone && (

                                            <span>
                                                {patientPhone}
                                            </span>

                                        )}

                                    </div>

                                </div>

                            </section>


                            {/* =============================================
                                ORDER ITEMS
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
                                                {totalItems}
                                                {" "}
                                                {totalItems === 1
                                                    ? "item"
                                                    : "items"}
                                            </span>

                                        </div>

                                    </div>


                                    {order.source ===
                                        "prescription" && (

                                            <span
                                                className={
                                                    styles.sourceBadge
                                                }
                                            >

                                                Prescription Order

                                            </span>

                                        )}

                                </div>


                                <div
                                    className={
                                        styles.itemsList
                                    }
                                >

                                    {(order.items || []).map(
                                        (item) => {

                                            const medicine =
                                                item.medicine ||
                                                {};


                                            const medicineName =
                                                medicine.name ||
                                                item.name ||
                                                "Medicine";


                                            const genericName =
                                                medicine.genericName ||
                                                item.genericName ||
                                                "";


                                            const strength =
                                                medicine.strength ||
                                                item.strength ||
                                                "";


                                            const price =
                                                Number(
                                                    item.price ??
                                                    medicine.price ??
                                                    0
                                                );


                                            const quantity =
                                                Number(
                                                    item.quantity ||
                                                    0
                                                );


                                            return (

                                                <div
                                                    key={
                                                        item._id ||
                                                        item.id ||
                                                        medicine._id ||
                                                        medicineName
                                                    }
                                                    className={
                                                        styles.item
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.itemIcon
                                                        }
                                                    >

                                                        <DescriptionOutlinedIcon />

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.itemInfo
                                                        }
                                                    >

                                                        <strong>
                                                            {medicineName}
                                                        </strong>

                                                        <span>

                                                            {genericName}

                                                            {genericName &&
                                                                strength
                                                                ? " • "
                                                                : ""}

                                                            {strength}

                                                        </span>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.itemQuantity
                                                        }
                                                    >

                                                        ×
                                                        {quantity}

                                                    </div>


                                                    <strong
                                                        className={
                                                            styles.itemPrice
                                                        }
                                                    >

                                                        ৳
                                                        {price *
                                                            quantity}

                                                    </strong>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            </section>

                        </div>


                        {/* =================================================
                            RIGHT
                        ================================================== */}

                        <aside
                            className={
                                styles.sidebar
                            }
                        >


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
                                            Payment
                                        </h2>

                                        <span>
                                            Order summary
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
                                            {subtotal}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Delivery
                                        </span>

                                        <strong>

                                            {deliveryFee ===
                                                0
                                                ? "FREE"
                                                : `৳${deliveryFee}`}

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
                                        ৳{total}
                                    </strong>

                                </div>


                                <div
                                    className={
                                        styles.paymentMethod
                                    }
                                >

                                    <span>
                                        Payment method
                                    </span>

                                    <strong>
                                        {paymentMethod}
                                    </strong>


                                    <span>
                                        Payment status
                                    </span>

                                    <strong
                                        className={
                                            paymentStatus ===
                                                "paid"
                                                ? styles.paid
                                                : styles.pendingPayment
                                        }
                                    >

                                        {paymentStatus ===
                                            "paid"
                                            ? "Paid"
                                            : "Pending"}

                                    </strong>

                                </div>

                            </section>


                            {/* =============================================
                                SUPPORT
                            ============================================== */}

                            <section
                                className={
                                    styles.supportCard
                                }
                            >

                                <div
                                    className={
                                        styles.supportIcon
                                    }
                                >

                                    <SupportAgentOutlinedIcon />

                                </div>


                                <div>

                                    <h3>
                                        Need help?
                                    </h3>

                                    <p>
                                        Contact MediLocate support
                                        about your order.
                                    </p>

                                </div>


                                <Link
                                    href="/contact"
                                    className={
                                        styles.supportButton
                                    }
                                >

                                    Contact Support

                                    <ArrowForwardRoundedIcon />

                                </Link>

                            </section>


                            {/* =============================================
                                REQUEST
                            ============================================== */}

                            {order.requestCode && (

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

                                        <DescriptionOutlinedIcon />

                                        <div>

                                            <h2>
                                                Prescription request
                                            </h2>

                                            <span>
                                                Original request
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.requestInfo
                                        }
                                    >

                                        <span>
                                            Request ID
                                        </span>

                                        <strong>
                                            {order.requestCode}
                                        </strong>

                                    </div>

                                </section>

                            )}

                        </aside>

                    </div>

                </div>

            </main>


            <Footer />

        </>

    );

}