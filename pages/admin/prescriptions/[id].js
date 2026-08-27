import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import axios from "axios";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import ZoomOutOutlinedIcon from "@mui/icons-material/ZoomOutOutlined";
import Rotate90DegreesCwOutlinedIcon from "@mui/icons-material/Rotate90DegreesCwOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Admin/Prescriptions/PrescriptionReview.module.css";


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const getStatusMeta = (status) => {

    switch (status) {

        case "pending":
            return {
                label: "Pending Review",
                className: "pending",
            };

        case "reviewing":
            return {
                label: "Reviewing",
                className: "reviewing",
            };

        case "order_created":
            return {
                label: "Order Created",
                className: "orderCreated",
            };

        case "completed":
            return {
                label: "Completed",
                className: "completed",
            };

        case "rejected":
            return {
                label: "Rejected",
                className: "rejected",
            };

        default:
            return {
                label: status || "Pending Review",
                className: "pending",
            };

    }

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

    try {

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

    } catch {

        return "N/A";

    }

};


/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function PrescriptionReviewPage({
    prescription,
    medicines = [],
}) {

    const router = useRouter();


    /*
    |--------------------------------------------------------------------------
    | PRESCRIPTION VIEWER
    |--------------------------------------------------------------------------
    */

    const [currentPage, setCurrentPage] =
        useState(0);

    const [zoom, setZoom] =
        useState(100);

    const [rotation, setRotation] =
        useState(0);


    /*
    |--------------------------------------------------------------------------
    | MEDICINE ORDER
    |--------------------------------------------------------------------------
    */

    const [orderItems, setOrderItems] =
        useState(
            (prescription?.medicines || []).map(
                (item) => ({
                    id:
                        item.medicine?._id ||
                        item.medicine ||
                        item.id,

                    name:
                        item.name || "",

                    genericName:
                        item.genericName || "",

                    strength:
                        item.strength || "",

                    unit:
                        item.unit || "",

                    price:
                        Number(item.price || 0),

                    quantity:
                        Number(item.quantity || 1),
                })
            )
        );


    const [medicineSearch, setMedicineSearch] =
        useState("");


    const [deliveryFee, setDeliveryFee] =
        useState(
            prescription?.order?.deliveryFee ??
            50
        );


    const [adminNote, setAdminNote] =
        useState(
            prescription?.internalNote || ""
        );


    const [rejectReason, setRejectReason] =
        useState("");


    const [showRejectModal, setShowRejectModal] =
        useState(false);


    const [submitting, setSubmitting] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | CURRENT FILE
    |--------------------------------------------------------------------------
    */

    const currentFile =
        prescription?.files?.[currentPage];


    /*
    |--------------------------------------------------------------------------
    | FILTER MEDICINES
    |--------------------------------------------------------------------------
    */

    const filteredCatalog =
        useMemo(() => {

            const query =
                medicineSearch
                    .trim()
                    .toLowerCase();


            if (!query) {
                return [];
            }


            return medicines.filter(
                (medicine) => {

                    return (
                        medicine.name
                            ?.toLowerCase()
                            .includes(query) ||

                        medicine.genericName
                            ?.toLowerCase()
                            .includes(query) ||

                        medicine.strength
                            ?.toLowerCase()
                            .includes(query)
                    );

                }
            );

        }, [
            medicineSearch,
            medicines,
        ]);


    /*
    |--------------------------------------------------------------------------
    | TOTALS
    |--------------------------------------------------------------------------
    */

    const subtotal =
        orderItems.reduce(
            (total, item) =>
                total +
                Number(item.price || 0) *
                Number(item.quantity || 0),
            0
        );


    const total =
        subtotal +
        Number(deliveryFee || 0);


    /*
    |--------------------------------------------------------------------------
    | ADD MEDICINE
    |--------------------------------------------------------------------------
    */

    const addMedicine = (medicine) => {

        setOrderItems(
            (previous) => {

                const existing =
                    previous.find(
                        (item) =>
                            item.id ===
                            medicine._id
                    );


                if (existing) {

                    return previous.map(
                        (item) =>
                            item.id ===
                            medicine._id
                                ? {
                                      ...item,
                                      quantity:
                                          item.quantity +
                                          1,
                                  }
                                : item
                    );

                }


                return [
                    ...previous,

                    {
                        id:
                            medicine._id,

                        name:
                            medicine.name,

                        genericName:
                            medicine.genericName || "",

                        strength:
                            medicine.strength || "",

                        unit:
                            medicine.unit || "",

                        price:
                            Number(
                                medicine.price || 0
                            ),

                        quantity: 1,
                    },
                ];

            }
        );


        setMedicineSearch("");

    };


    /*
    |--------------------------------------------------------------------------
    | INCREASE
    |--------------------------------------------------------------------------
    */

    const increaseQuantity = (id) => {

        setOrderItems(
            (previous) =>
                previous.map(
                    (item) =>
                        item.id === id
                            ? {
                                  ...item,
                                  quantity:
                                      item.quantity +
                                      1,
                              }
                            : item
                )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | DECREASE
    |--------------------------------------------------------------------------
    */

    const decreaseQuantity = (id) => {

        setOrderItems(
            (previous) =>
                previous
                    .map(
                        (item) =>
                            item.id === id
                                ? {
                                      ...item,
                                      quantity:
                                          item.quantity -
                                          1,
                                  }
                                : item
                    )
                    .filter(
                        (item) =>
                            item.quantity > 0
                    )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | REMOVE
    |--------------------------------------------------------------------------
    */

    const removeMedicine = (id) => {

        setOrderItems(
            (previous) =>
                previous.filter(
                    (item) =>
                        item.id !== id
                )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CREATE ORDER
    |--------------------------------------------------------------------------
    */

   const handleCreateOrder = async () => {

    if (!orderItems.length) {

        alert(
            "Please add at least one medicine."
        );

        return;
    }

    try {

        setSubmitting(true);

        const response =
            await axios.post(
                `/api/admin/prescriptions/${router.query.id}/create-order`,
                {
                    items:
                        orderItems.map(
                            (item) => ({
                                medicine:
                                    item.id,

                                quantity:
                                    item.quantity,
                            })
                        ),

                    deliveryFee:
                        Number(
                            deliveryFee || 0
                        ),

                    adminNote:
                        adminNote || "",
                }
            );

        if (
            !response.data?.success
        ) {
            throw new Error(
                response.data?.message ||
                "Failed to create order."
            );
        }

        alert(
            `Order created successfully.\nTracking: ${response.data.order.trackingNumber}`
        );

        router.push(
            "/admin/prescriptions"
        );

    } catch (error) {

        console.error(
            "Create order error:",
            error?.response?.data ||
            error
        );

        alert(
            error?.response?.data?.message ||
            "Failed to create order."
        );

    } finally {

        setSubmitting(false);

    }
};


    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    const handleReject = async () => {

        if (!rejectReason.trim()) {

            alert(
                "Please provide a reason for rejection."
            );

            return;

        }


        try {

            setSubmitting(true);


            const response =
                await axios.patch(
                    `/api/admin/prescriptions/${prescription._id}`,
                    {
                        status:
                            "rejected",

                        reason:
                            rejectReason.trim(),
                    }
                );


            if (!response.data?.success) {

                throw new Error(
                    response.data?.message ||
                    "Failed to reject prescription."
                );

            }


            setShowRejectModal(false);


            alert(
                "Prescription rejected successfully."
            );


            router.push(
                "/admin/prescriptions"
            );


        } catch (error) {

            console.error(
                "Reject prescription error:",
                error
            );


            alert(
                error?.response?.data?.message ||
                "Failed to reject prescription."
            );

        } finally {

            setSubmitting(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD
    |--------------------------------------------------------------------------
    */

    const handleDownload = () => {

        if (!currentFile?.url) {
            return;
        }

        window.open(
            currentFile.url,
            "_blank",
            "noopener,noreferrer"
        );

    };


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


                <Navbar />


                <main className={styles.notFound}>

                    <DescriptionOutlinedIcon />

                    <h1>
                        Prescription request not found
                    </h1>

                    <p>
                        The request you're looking for
                        does not exist.
                    </p>


                    <Link
                        href="/admin/prescriptions"
                    >

                        <ArrowBackRoundedIcon />

                        Back to Requests

                    </Link>

                </main>


                <Footer />

            </>
        );

    }


    const statusMeta =
        getStatusMeta(
            prescription.status
        );


    return (
        <>
            <Head>

                <title>
                    {prescription.requestCode} |
                    {" "}
                    Prescription Review
                </title>

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =====================================================
                        TOP BAR
                    ====================================================== */}

                    <div className={styles.topBar}>

                        <Link
                            href="/admin/prescriptions"
                            className={styles.backLink}
                        >

                            <ArrowBackRoundedIcon />

                            Prescription Requests

                        </Link>


                        <div className={styles.requestMeta}>

                            <span>
                                {
                                    prescription.requestCode
                                }
                            </span>

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

                    </div>


                    {/* =====================================================
                        PAGE HEADER
                    ====================================================== */}

                    <header className={styles.pageHeader}>

                        <div>

                            <span>
                                PRESCRIPTION REVIEW
                            </span>

                            <h1>
                                Review request
                            </h1>

                            <p>
                                Review the prescription, identify
                                the medicines and create the patient's
                                medicine order.
                            </p>

                        </div>


                        <div
                            className={
                                styles.headerActions
                            }
                        >

                            {prescription.status !==
                                "order_created" &&
                                prescription.status !==
                                    "completed" && (

                                <button
                                    type="button"
                                    className={
                                        styles.rejectButton
                                    }
                                    onClick={() =>
                                        setShowRejectModal(
                                            true
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                >

                                    <CloseRoundedIcon />

                                    Reject

                                </button>

                            )}


                            <button
                                type="button"
                                className={
                                    styles.createTopButton
                                }
                                onClick={
                                    handleCreateOrder
                                }
                                disabled={
                                    submitting ||
                                    !orderItems.length ||
                                    prescription.status ===
                                        "completed"
                                }
                            >

                                <ShoppingBagOutlinedIcon />

                                {submitting
                                    ? "Creating..."
                                    : "Create Order"}

                            </button>

                        </div>

                    </header>


                    {/* =====================================================
                        MAIN GRID
                    ====================================================== */}

                    <div className={styles.mainGrid}>


                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <section
                            className={
                                styles.viewerCard
                            }
                        >

                            <div
                                className={
                                    styles.cardHeader
                                }
                            >

                                <div>

                                    <h2>
                                        Prescription
                                    </h2>

                                    <span>

                                        {
                                            prescription
                                                .files
                                                ?.length || 0
                                        }

                                        {" "}

                                        {
                                            prescription
                                                .files
                                                ?.length === 1
                                                ? "page"
                                                : "pages"
                                        }

                                    </span>

                                </div>


                                <div
                                    className={
                                        styles.viewerTools
                                    }
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setZoom(
                                                Math.max(
                                                    50,
                                                    zoom - 10
                                                )
                                            )
                                        }
                                        aria-label="Zoom out"
                                    >

                                        <ZoomOutOutlinedIcon />

                                    </button>


                                    <span>
                                        {zoom}%
                                    </span>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setZoom(
                                                Math.min(
                                                    180,
                                                    zoom + 10
                                                )
                                            )
                                        }
                                        aria-label="Zoom in"
                                    >

                                        <ZoomInOutlinedIcon />

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRotation(
                                                (rotation +
                                                    90) %
                                                360
                                            )
                                        }
                                        aria-label="Rotate"
                                    >

                                        <Rotate90DegreesCwOutlinedIcon />

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handleDownload
                                        }
                                        aria-label="Download prescription"
                                    >

                                        <DownloadOutlinedIcon />

                                    </button>

                                </div>

                            </div>


                            {/* DOCUMENT */}

                            <div
                                className={
                                    styles.documentArea
                                }
                            >

                                <div
                                    className={
                                        styles.documentFrame
                                    }
                                    style={{
                                        transform:
                                            `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                    }}
                                >

                                    {currentFile?.url ? (

                                        <img
                                            src={
                                                currentFile.url
                                            }
                                            alt={
                                                currentFile.name ||
                                                "Prescription"
                                            }
                                        />

                                    ) : (

                                        <div
                                            className={
                                                styles.documentPlaceholder
                                            }
                                        >

                                            <DescriptionOutlinedIcon />

                                            <span>
                                                Prescription
                                                preview
                                            </span>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* THUMBNAILS */}

                            <div
                                className={
                                    styles.thumbnails
                                }
                            >

                                {(
                                    prescription.files ||
                                    []
                                ).map(
                                    (file, index) => (

                                        <button
                                            type="button"
                                            key={
                                                file._id ||
                                                file.publicId ||
                                                index
                                            }
                                            onClick={() =>
                                                setCurrentPage(
                                                    index
                                                )
                                            }
                                            className={
                                                index ===
                                                currentPage
                                                    ? styles.thumbnailActive
                                                    : styles.thumbnail
                                            }
                                        >

                                            {file.url ? (

                                                <img
                                                    src={
                                                        file.url
                                                    }
                                                    alt={`Page ${
                                                        index +
                                                        1
                                                    }`}
                                                />

                                            ) : (

                                                <DescriptionOutlinedIcon />

                                            )}

                                            <span>
                                                {index + 1}
                                            </span>

                                        </button>

                                    )
                                )}

                            </div>

                        </section>


                        {/* =================================================
                            RIGHT
                        ================================================== */}

                        <aside
                            className={
                                styles.sidebar
                            }
                        >


                            {/* PATIENT */}

                            <section
                                className={
                                    styles.sidebarCard
                                }
                            >

                                <div
                                    className={
                                        styles.sidebarTitle
                                    }
                                >

                                    <PersonOutlineRoundedIcon />

                                    <div>

                                        <h2>
                                            Patient information
                                        </h2>

                                        <span>
                                            Prescription requester
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.patientDetails
                                    }
                                >

                                    <div>

                                        <PersonOutlineRoundedIcon />

                                        <div>

                                            <span>
                                                Patient
                                            </span>

                                            <strong>
                                                {
                                                    prescription
                                                        .patient
                                                        ?.name ||
                                                    "N/A"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div>

                                        <PhoneOutlinedIcon />

                                        <div>

                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {
                                                    prescription
                                                        .patient
                                                        ?.phone ||
                                                    "N/A"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div>

                                        <LocationOnOutlinedIcon />

                                        <div>

                                            <span>
                                                Delivery address
                                            </span>

                                            <strong>
                                                {
                                                    [
                                                        prescription
                                                            .patient
                                                            ?.address,

                                                        prescription
                                                            .patient
                                                            ?.city,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") ||
                                                    "N/A"
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div>

                                        <CalendarTodayOutlinedIcon />

                                        <div>

                                            <span>
                                                Submitted
                                            </span>

                                            <strong>
                                                {
                                                    formatDate(
                                                        prescription.createdAt
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {prescription.notes && (

                                    <div
                                        className={
                                            styles.patientNote
                                        }
                                    >

                                        <WarningAmberRoundedIcon />

                                        <div>

                                            <span>
                                                Patient note
                                            </span>

                                            <p>
                                                {
                                                    prescription.notes
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )}

                            </section>


                            {/* MEDICINES */}

                            <section
                                className={
                                    styles.sidebarCard
                                }
                            >

                                <div
                                    className={
                                        styles.sidebarTitle
                                    }
                                >

                                    <ShoppingBagOutlinedIcon />

                                    <div>

                                        <h2>
                                            Order medicines
                                        </h2>

                                        <span>
                                            Identify medicines
                                            from prescription
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.medicineSearch
                                    }
                                >

                                    <SearchRoundedIcon />

                                    <input
                                        type="text"
                                        value={
                                            medicineSearch
                                        }
                                        onChange={(event) =>
                                            setMedicineSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search medicine..."
                                    />

                                </div>


                                {medicineSearch && (

                                    <div
                                        className={
                                            styles.catalogResults
                                        }
                                    >

                                        {filteredCatalog.length >
                                        0 ? (

                                            filteredCatalog.map(
                                                (medicine) => (

                                                    <button
                                                        type="button"
                                                        key={
                                                            medicine._id
                                                        }
                                                        onClick={() =>
                                                            addMedicine(
                                                                medicine
                                                            )
                                                        }
                                                        className={
                                                            styles.catalogItem
                                                        }
                                                    >

                                                        <div>

                                                            <strong>
                                                                {
                                                                    medicine.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    medicine.genericName
                                                                }
                                                                {" • "}
                                                                {
                                                                    medicine.strength
                                                                }
                                                            </span>

                                                        </div>


                                                        <span>
                                                            ৳
                                                            {
                                                                medicine.price
                                                            }
                                                        </span>

                                                    </button>

                                                )
                                            )

                                        ) : (

                                            <div
                                                className={
                                                    styles.emptyItems
                                                }
                                            >

                                                No medicine found.

                                            </div>

                                        )}

                                    </div>

                                )}


                                {/* ORDER ITEMS */}

                                <div
                                    className={
                                        styles.orderItems
                                    }
                                >

                                    {orderItems.length === 0 ? (

                                        <div
                                            className={
                                                styles.emptyItems
                                            }
                                        >

                                            <ShoppingBagOutlinedIcon />

                                            <span>
                                                No medicines added yet
                                            </span>

                                        </div>

                                    ) : (

                                        orderItems.map(
                                            (item) => (

                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className={
                                                        styles.orderItem
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.itemInfo
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                item.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.genericName
                                                            }
                                                            {" • "}
                                                            {
                                                                item.strength
                                                            }
                                                        </span>

                                                        <small>
                                                            ৳
                                                            {
                                                                item.price
                                                            }
                                                            {" "}
                                                            / pack
                                                        </small>

                                                    </div>


                                                    <div
                                                        className={
                                                            styles.itemActions
                                                        }
                                                    >

                                                        <div
                                                            className={
                                                                styles.quantity
                                                            }
                                                        >

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    decreaseQuantity(
                                                                        item.id
                                                                    )
                                                                }
                                                                aria-label="Decrease"
                                                            >

                                                                <RemoveRoundedIcon />

                                                            </button>


                                                            <strong>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </strong>


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    increaseQuantity(
                                                                        item.id
                                                                    )
                                                                }
                                                                aria-label="Increase"
                                                            >

                                                                <AddRoundedIcon />

                                                            </button>

                                                        </div>


                                                        <strong
                                                            className={
                                                                styles.itemTotal
                                                            }
                                                        >
                                                            ৳
                                                            {
                                                                item.price *
                                                                item.quantity
                                                            }
                                                        </strong>


                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.removeItem
                                                            }
                                                            onClick={() =>
                                                                removeMedicine(
                                                                    item.id
                                                                )
                                                            }
                                                            aria-label="Remove medicine"
                                                        >

                                                            <DeleteOutlineRoundedIcon />

                                                        </button>

                                                    </div>

                                                </div>

                                            )
                                        )

                                    )}

                                </div>

                            </section>


                            {/* ORDER SUMMARY */}

                            <section
                                className={
                                    styles.sidebarCard
                                }
                            >

                                <div
                                    className={
                                        styles.sidebarTitle
                                    }
                                >

                                    <LocalShippingOutlinedIcon />

                                    <div>

                                        <h2>
                                            Order summary
                                        </h2>

                                        <span>
                                            Review before creating
                                            the order
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
                                            ৳{subtotal}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Delivery fee
                                        </span>


                                        <div
                                            className={
                                                styles.deliveryInput
                                            }
                                        >

                                            <span>
                                                ৳
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                value={
                                                    deliveryFee
                                                }
                                                onChange={(event) =>
                                                    setDeliveryFee(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                        </div>

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
                                        styles.adminNote
                                    }
                                >

                                    <label>
                                        Internal note
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={
                                            adminNote
                                        }
                                        onChange={(event) =>
                                            setAdminNote(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Optional note for this order..."
                                    />

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.createOrderButton
                                    }
                                    onClick={
                                        handleCreateOrder
                                    }
                                    disabled={
                                        submitting ||
                                        !orderItems.length
                                    }
                                >

                                    <CheckCircleRoundedIcon />

                                    {submitting
                                        ? "Creating order..."
                                        : "Create Order"}

                                    {!submitting && (
                                        <ArrowForwardRoundedIcon />
                                    )}

                                </button>


                                <p
                                    className={
                                        styles.createNote
                                    }
                                >
                                    Creating the order will move
                                    this prescription request to
                                    <strong>
                                        Order Created
                                    </strong>
                                    status.
                                </p>

                            </section>

                        </aside>

                    </div>

                </div>

            </main>


            {/* =====================================================
                REJECT MODAL
            ====================================================== */}

            {showRejectModal && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setShowRejectModal(false)
                    }
                >

                    <div
                        className={
                            styles.rejectModal
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
                                setShowRejectModal(false)
                            }
                            aria-label="Close"
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.modalIcon
                            }
                        >

                            <WarningAmberRoundedIcon />

                        </div>


                        <h2>
                            Reject prescription?
                        </h2>


                        <p>
                            Please provide a reason before
                            rejecting this prescription request.
                        </p>


                        <textarea
                            className={
                                styles.rejectReason
                            }
                            value={
                                rejectReason
                            }
                            onChange={(event) =>
                                setRejectReason(
                                    event.target.value
                                )
                            }
                            placeholder="Reason for rejection..."
                            rows={4}
                        />


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    setShowRejectModal(
                                        false
                                    )
                                }
                                className={
                                    styles.cancelButton
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleReject
                                }
                                className={
                                    styles.confirmRejectButton
                                }
                                disabled={
                                    submitting
                                }
                            >

                                {submitting
                                    ? "Rejecting..."
                                    : "Reject Request"}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            <Footer />

        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(context) {

    const {
        params,
        req,
    } = context;


    const id =
        params?.id;


    if (!id) {

        return {
            notFound: true,
        };

    }


    try {

        /*
        |--------------------------------------------------------------------------
        | DATABASE DIRECTLY
        |--------------------------------------------------------------------------
        |
        | Because this is getServerSideProps, there is no reason
        | to call your own API endpoint here.
        |
        */

        const db =
            (await import(
                "@/database/connection"
            )).default;

        const Prescription =
            (await import(
                "@/database/model/Prescription"
            )).default;

        const Medicine =
            (await import(
                "@/database/model/Medicine"
            )).default;


        await db.connect();


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        const prescription =
            await Prescription
                .findById(id)
                .populate(
                    "user",
                    "name phone email"
                )
                .populate(
                    "order",
                    "orderId trackingNumber status deliveryFee total"
                )
                .lean();


        if (!prescription) {

            return {
                notFound: true,
            };

        }


        /*
        |--------------------------------------------------------------------------
        | MEDICINE CATALOG
        |--------------------------------------------------------------------------
        */

        const medicines =
            await Medicine
                .find({
                    status: {
                        $ne: "inactive",
                    },
                })
                .select(
                    "name genericName strength unit price prescriptionRequired status"
                )
                .sort({
                    name: 1,
                })
                .lean();


        /*
        |--------------------------------------------------------------------------
        | SERIALIZE MONGOOSE DATA
        |--------------------------------------------------------------------------
        */

        const serializedPrescription =
            JSON.parse(
                JSON.stringify(
                    prescription
                )
            );


        const serializedMedicines =
            JSON.parse(
                JSON.stringify(
                    medicines
                )
            );


        return {

            props: {

                prescription:
                    serializedPrescription,

                medicines:
                    serializedMedicines,

            },

        };


    } catch (error) {

        console.error(
            "Prescription review SSR error:",
            error
        );


        return {
            notFound: true,
        };

    }

}