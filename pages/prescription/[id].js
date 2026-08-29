import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";


import styles from "@/styles/Medicines/PrescriptionTracking.module.css";

/*
|--------------------------------------------------------------------------
| STATUS META
|--------------------------------------------------------------------------
*/

const getStatusMeta = (status) => {

    switch (status) {

        case "pending":
            return {
                label: "Under review",
                heading: "Prescription received",
            };

        case "reviewing":
            return {
                label: "Under review",
                heading: "Our team is reviewing your prescription",
            };

        case "medicines_identified":
            return {
                label: "Medicines identified",
                heading: "Medicines have been identified",
            };

        case "order_created":
            return {
                label: "Order created",
                heading: "Your medicine order is ready",
            };

        case "completed":
            return {
                label: "Completed",
                heading: "Your prescription order is completed",
            };

        case "cancelled":
            return {
                label: "Cancelled",
                heading: "This prescription request was cancelled",
            };

        case "rejected":
            return {
                label: "Rejected",
                heading: "Prescription request was rejected",
            };

        default:
            return {
                label: status || "Pending",
                heading: "Prescription request",
            };

    }

};


/*
|--------------------------------------------------------------------------
| STATUS ORDER
|--------------------------------------------------------------------------
*/

const statusOrder = [
    "pending",
    "reviewing",
    "medicines_identified",
    "order_created",
    "completed",
];


/*
|--------------------------------------------------------------------------
| DATE FORMAT
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {

    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-BD",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    ).format(
        new Date(date)
    );

};


/*
|--------------------------------------------------------------------------
| TIMELINE ITEM
|--------------------------------------------------------------------------
*/

const timelineItems = [
    {
        key: "pending",
        title: "Prescription received",
        description:
            "Your prescription has been successfully submitted.",
        icon: CheckCircleRoundedIcon,
    },
    {
        key: "reviewing",
        title: "Under review",
        description:
            "Our pharmacy team is reviewing your prescription.",
        icon: DescriptionOutlinedIcon,
    },
    {
        key: "medicines_identified",
        title: "Medicines identified",
        description:
            "The required medicines have been identified from your prescription.",
        icon: LocalPharmacyOutlinedIcon,
    },
    {
        key: "order_created",
        title: "Order preparation",
        description:
            "Your medicine order has been created and is being prepared.",
        icon: ShoppingBagOutlinedIcon,
    },
    {
        key: "completed",
        title: "Delivery completed",
        description:
            "Your medicine order has been delivered successfully.",
        icon: LocalShippingOutlinedIcon,
    },
];


export default function PrescriptionTrackingPage({
    prescription,
}) {

    const router = useRouter();


    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!prescription) {

        return (
            <>
                <Head>

                    <title>
                        Prescription Not Found | MediLocate
                    </title>

                </Head>




                <main className={styles.page}>

                    <div className={styles.container}>

                        <section
                            className={
                                styles.successCard
                            }
                        >

                            <div
                                className={
                                    styles.successIcon
                                }
                            >

                                <DescriptionOutlinedIcon />

                            </div>


                            <span
                                className={
                                    styles.label
                                }
                            >
                                PRESCRIPTION
                            </span>


                            <h1>
                                Prescription request not found.
                            </h1>


                            <p
                                className={
                                    styles.description
                                }
                            >
                                We couldn't find the prescription
                                request you're looking for.
                            </p>


                            <div
                                className={
                                    styles.actions
                                }
                            >

                                <Link
                                    href="/medicines"
                                    className={
                                        styles.primaryButton
                                    }
                                >

                                    <ArrowBackRoundedIcon />

                                    Back to Medicines

                                </Link>

                            </div>

                        </section>

                    </div>

                </main>


            </>
        );

    }


    const status =
        prescription.status;


    const statusMeta =
        getStatusMeta(status);


    const currentIndex =
        statusOrder.indexOf(status);


    const isRejected =
        status === "rejected";


    const isCancelled =
        status === "cancelled";


    const hasOrder =
        Boolean(
            prescription.order
        );


    return (
        <>
            <Head>

                <title>
                    Track {prescription.requestCode} | MediLocate
                </title>


                <meta
                    name="description"
                    content="Track your MediLocate prescription request and medicine order."
                />

            </Head>




            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        BACK
                    ====================================================== */}

                    <div
                        style={{
                            marginBottom: "18px",
                        }}
                    >

                        <Link
                            href="/medicines"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#0f9d8a",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                            }}
                        >

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>

                    </div>


                    {/* =====================================================
                        TRACKING CARD
                    ====================================================== */}

                    <section
                        className={
                            styles.successCard
                        }
                    >

                        <div
                            className={
                                styles.successIcon
                            }
                        >

                            {isRejected ||
                                isCancelled ? (

                                <WarningAmberRoundedIcon />

                            ) : (

                                <CheckCircleRoundedIcon />

                            )}

                        </div>


                        <span
                            className={
                                styles.label
                            }
                        >
                            PRESCRIPTION TRACKING
                        </span>


                        <h1>
                            {
                                statusMeta.heading
                            }
                        </h1>


                        <p
                            className={
                                styles.description
                            }
                        >

                            {isRejected
                                ? "Your prescription request could not be processed."
                                : isCancelled
                                    ? "This prescription request has been cancelled."
                                    : "You can track the progress of your prescription request and medicine order here."
                            }

                        </p>


                        {/* =================================================
                            REQUEST CODE
                        ================================================== */}

                        <div
                            className={
                                styles.requestId
                            }
                        >

                            <span>
                                Request ID
                            </span>

                            <strong>
                                {
                                    prescription.requestCode
                                }
                            </strong>

                        </div>


                        {/* =================================================
                            CURRENT STATUS
                        ================================================== */}

                        <div
                            className={
                                styles.statusCard
                            }
                        >

                            <div
                                className={
                                    styles.statusHeader
                                }
                            >

                                <div>

                                    <span>
                                        REQUEST STATUS
                                    </span>


                                    <h2>
                                        {
                                            statusMeta.heading
                                        }
                                    </h2>

                                </div>


                                <span
                                    className={
                                        styles.pendingBadge
                                    }
                                >
                                    {
                                        statusMeta.label
                                    }
                                </span>

                            </div>


                            {/* =================================================
                                TIMELINE
                            ================================================== */}

                            <div
                                className={
                                    styles.timeline
                                }
                            >

                                {timelineItems.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const Icon =
                                            item.icon;


                                        const itemIndex =
                                            statusOrder.indexOf(
                                                item.key
                                            );


                                        const completed =
                                            !isRejected &&
                                            !isCancelled &&
                                            currentIndex >=
                                            itemIndex;


                                        const current =
                                            !isRejected &&
                                            !isCancelled &&
                                            status ===
                                            item.key;


                                        let className =
                                            styles.timelineItem;


                                        if (
                                            completed
                                        ) {

                                            className +=
                                                ` ${styles.completed}`;

                                        }


                                        if (
                                            current
                                        ) {

                                            className +=
                                                ` ${styles.current}`;

                                        }


                                        return (

                                            <div
                                                key={
                                                    item.key
                                                }
                                                className={
                                                    className
                                                }
                                            >

                                                <div
                                                    className={
                                                        styles.timelineIcon
                                                    }
                                                >

                                                    <Icon />

                                                </div>


                                                <div
                                                    className={
                                                        styles.timelineContent
                                                    }
                                                >

                                                    <strong>
                                                        {
                                                            item.title
                                                        }
                                                    </strong>


                                                    <span>
                                                        {
                                                            item.description
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}


                                {/* =================================================
                                    REJECTED
                                ================================================== */}

                                {isRejected && (

                                    <div
                                        className={`${styles.timelineItem} ${styles.current}`}
                                    >

                                        <div
                                            className={
                                                styles.timelineIcon
                                            }
                                        >

                                            <WarningAmberRoundedIcon />

                                        </div>


                                        <div
                                            className={
                                                styles.timelineContent
                                            }
                                        >

                                            <strong>
                                                Prescription rejected
                                            </strong>


                                            <span>
                                                {
                                                    prescription.reviewNote ||
                                                    "Our pharmacy team could not process this prescription."
                                                }
                                            </span>

                                        </div>

                                    </div>

                                )}


                                {/* =================================================
                                    CANCELLED
                                ================================================== */}

                                {isCancelled && (

                                    <div
                                        className={`${styles.timelineItem} ${styles.current}`}
                                    >

                                        <div
                                            className={
                                                styles.timelineIcon
                                            }
                                        >

                                            <WarningAmberRoundedIcon />

                                        </div>


                                        <div
                                            className={
                                                styles.timelineContent
                                            }
                                        >

                                            <strong>
                                                Request cancelled
                                            </strong>


                                            <span>
                                                This prescription request
                                                is no longer active.
                                            </span>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            ORDER CARD
                        ================================================== */}

                        {hasOrder && (

                            <div
                                className={
                                    styles.statusCard
                                }
                                style={{
                                    marginTop: "18px",
                                }}
                            >

                                <div
                                    className={
                                        styles.statusHeader
                                    }
                                >

                                    <div>

                                        <span>
                                            MEDICINE ORDER
                                        </span>


                                        <h2>
                                            Your order has been created
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.note
                                    }
                                >

                                    <ShoppingBagOutlinedIcon />


                                    <p>

                                        <strong>
                                            Order created.
                                        </strong>

                                        {" "}

                                        Your prescription has been
                                        converted into a medicine order.

                                        {prescription.order
                                            ?.trackingNumber && (
                                                <>
                                                    {" "}
                                                    Tracking number:
                                                    {" "}
                                                    <strong>
                                                        {
                                                            prescription
                                                                .order
                                                                .trackingNumber
                                                        }
                                                    </strong>
                                                </>
                                            )}

                                    </p>

                                </div>


                                <Link
                                    href={
                                        prescription
                                            .order
                                            ?.trackingNumber
                                            ? `/orders/${prescription.order.trackingNumber}`
                                            : `/orders/${prescription.order?._id}`
                                    }
                                    className={
                                        styles.primaryButton
                                    }
                                >

                                    <ShoppingBagOutlinedIcon />

                                    See Order

                                    <ArrowForwardRoundedIcon />

                                </Link>

                            </div>

                        )}


                        {/* =================================================
                            PATIENT INFORMATION
                        ================================================== */}

                        <div
                            className={
                                styles.statusCard
                            }
                            style={{
                                marginTop: "18px",
                            }}
                        >

                            <div
                                className={
                                    styles.statusHeader
                                }
                            >

                                <div>

                                    <span>
                                        DELIVERY INFORMATION
                                    </span>


                                    <h2>
                                        Patient & delivery details
                                    </h2>

                                </div>

                            </div>


                            <div
                                style={{
                                    display: "grid",
                                    gap: "12px",
                                    marginTop: "16px",
                                }}
                            >

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "flex-start",
                                    }}
                                >

                                    <PersonOutlineRoundedIcon />

                                    <div>

                                        <span>
                                            Patient
                                        </span>

                                        <strong
                                            style={{
                                                display: "block",
                                                marginTop: "3px",
                                            }}
                                        >
                                            {
                                                prescription
                                                    .patient
                                                    ?.name
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "flex-start",
                                    }}
                                >

                                    <PhoneOutlinedIcon />

                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <strong
                                            style={{
                                                display: "block",
                                                marginTop: "3px",
                                            }}
                                        >
                                            {
                                                prescription
                                                    .patient
                                                    ?.phone
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "flex-start",
                                    }}
                                >

                                    <LocationOnOutlinedIcon />

                                    <div>

                                        <span>
                                            Address
                                        </span>

                                        <strong
                                            style={{
                                                display: "block",
                                                marginTop: "3px",
                                            }}
                                        >
                                            {
                                                [
                                                    prescription
                                                        .patient
                                                        ?.address,

                                                    prescription
                                                        .patient
                                                        ?.city,
                                                ]
                                                    .filter(
                                                        Boolean
                                                    )
                                                    .join(", ")
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "flex-start",
                                    }}
                                >

                                    <CalendarTodayOutlinedIcon />

                                    <div>

                                        <span>
                                            Submitted
                                        </span>

                                        <strong
                                            style={{
                                                display: "block",
                                                marginTop: "3px",
                                            }}
                                        >
                                            {
                                                formatDate(
                                                    prescription.createdAt
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            NOTE
                        ================================================== */}

                        {!hasOrder &&
                            !isRejected &&
                            !isCancelled && (

                                <div
                                    className={
                                        styles.note
                                    }
                                >

                                    <DescriptionOutlinedIcon />

                                    <p>

                                        Your prescription is being
                                        reviewed by our pharmacy team.
                                        We'll update this request as
                                        soon as there is progress.

                                    </p>

                                </div>

                            )}


                        {/* =================================================
                            ACTIONS
                        ================================================== */}

                        <div
                            className={
                                styles.actions
                            }
                        >

                            <Link
                                href="/"
                                className={
                                    styles.primaryButton
                                }
                            >

                                <HomeOutlinedIcon />

                                Back to Home

                            </Link>


                            <Link
                                href="/medicines"
                                className={
                                    styles.secondaryButton
                                }
                            >

                                Browse Medicines

                                <ArrowForwardRoundedIcon />

                            </Link>

                        </div>

                    </section>


                    {/* =====================================================
                        HELP
                    ====================================================== */}

                    <div
                        className={
                            styles.help
                        }
                    >

                        <DescriptionOutlinedIcon />

                        <span>
                            Keep your request ID
                            <strong>
                                {" "}
                                {
                                    prescription.requestCode
                                }
                                {" "}
                            </strong>
                            for future reference.
                        </span>

                    </div>

                </div>

            </main>



        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA
|--------------------------------------------------------------------------
*/
import axios from "axios";
import BASE_URL from "@/config";


export async function getServerSideProps(context) {

    try {

        const {
            params,
            req,
        } = context;


        const identifier =
            params?.id;


        if (!identifier) {

            return {
                notFound: true,
            };

        }


        const apiUrl =
            `${BASE_URL}/api/prescriptions/${encodeURIComponent(
                identifier
            )}`;


        console.log(
            "Prescription tracking API:",
            apiUrl
        );


        const response =
            await axios.get(
                apiUrl,
                {
                    headers: {
                        cookie:
                            req.headers.cookie || "",
                    },
                }
            );


        console.log(
            "Prescription API response:",
            response.data
        );


        const data =
            response.data;


        if (
            !data?.success ||
            !data?.prescription
        ) {

            console.error(
                "Invalid prescription response:",
                data
            );

            return {
                notFound: true,
            };

        }


        return {

            props: {

                prescription:
                    JSON.parse(
                        JSON.stringify(
                            data.prescription
                        )
                    ),

            },

        };

    } catch (error) {

        console.error(
            "Prescription tracking SSR error:",
            error
        );


        console.error(
            "API status:",
            error?.response?.status
        );


        console.error(
            "API data:",
            error?.response?.data
        );


        console.error(
            "API URL:",
            error?.config?.url
        );


        if (
            error?.response?.status ===
            404
        ) {

            return {
                notFound: true,
            };

        }


        return {
            notFound: true,
        };

    }

}