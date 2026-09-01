import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useDispatch } from "react-redux";
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import {
    showSnackBar,
} from "@/redux/notistackSlice";

import styles from "@/styles/Admin/Prescriptions/PrescriptionReview.module.css";


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const getStatusMeta = (
    status
) => {

    switch (status) {

        case "pending":

            return {
                label:
                    "Pending Review",

                className:
                    "pending",
            };


        case "reviewing":

            return {
                label:
                    "Reviewing",

                className:
                    "reviewing",
            };


        case "order_created":

            return {
                label:
                    "Order Created",

                className:
                    "orderCreated",
            };


        case "completed":

            return {
                label:
                    "Completed",

                className:
                    "completed",
            };


        case "rejected":

            return {
                label:
                    "Rejected",

                className:
                    "rejected",
            };


        default:

            return {
                label:
                    status ||
                    "Pending Review",

                className:
                    "pending",
            };

    }

};


/*
|--------------------------------------------------------------------------
| DATE
|--------------------------------------------------------------------------
*/

const formatDate = (
    date
) => {

    if (!date) {

        return "N/A";

    }


    try {

        return new Date(
            date
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
                    "2-digit",

                minute:
                    "2-digit",

            }
        );


    } catch {

        return "N/A";

    }

};


/*
|--------------------------------------------------------------------------
| BUILD ORDER ITEMS
|--------------------------------------------------------------------------
|
| Before order creation:
|
| prescription.medicines
|
| After order creation:
|
| prescription.order.items
|
*/

const buildInitialOrderItems = (
    prescription,
    medicines = []
) => {

    const existingOrderItems =
        prescription
            ?.order
            ?.items;


    const prescriptionItems =
        prescription
            ?.medicines;


    const sourceItems =
        Array.isArray(
            existingOrderItems
        ) &&
        existingOrderItems.length

            ? existingOrderItems

            : Array.isArray(
                prescriptionItems
            )

                ? prescriptionItems

                : [];


    return sourceItems

        .map(
            (
                item
            ) => {

                /*
                |--------------------------------------------------------------------------
                | MEDICINE VALUE
                |--------------------------------------------------------------------------
                */

                const medicineValue =
                    item?.medicine;


                const medicineObject =
                    medicineValue &&
                    typeof medicineValue ===
                        "object"

                        ? medicineValue

                        : null;


                const medicineId =
                    medicineObject?._id ||

                    medicineValue ||

                    item?.medicineId ||

                    item?.id;


                /*
                |--------------------------------------------------------------------------
                | CATALOG FALLBACK
                |--------------------------------------------------------------------------
                */

                const catalogMedicine =
                    medicines.find(
                        (
                            medicine
                        ) =>

                            String(
                                medicine._id
                            ) ===
                            String(
                                medicineId
                            )
                    );


                return {

                    id:
                        medicineId

                            ? String(
                                medicineId
                            )

                            : "",


                    name:

                        item?.name ||

                        medicineObject
                            ?.name ||

                        catalogMedicine
                            ?.name ||

                        "",


                    genericName:

                        item?.genericName ||

                        medicineObject
                            ?.genericName ||

                        catalogMedicine
                            ?.genericName ||

                        "",


                    strength:

                        item?.strength ||

                        medicineObject
                            ?.strength ||

                        catalogMedicine
                            ?.strength ||

                        "",


                    unit:

                        item?.unit ||

                        medicineObject
                            ?.unit ||

                        catalogMedicine
                            ?.unit ||

                        "",


                    price:
                        Number(

                            item?.unitPrice ??

                            item?.price ??

                            medicineObject
                                ?.price ??

                            catalogMedicine
                                ?.price ??

                            0

                        ),


                    quantity:
                        Number(
                            item?.quantity ||
                            1
                        ),

                };

            }
        )

        .filter(
            (
                item
            ) =>
                Boolean(
                    item.id
                )
        );

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

    const router =
        useRouter();


    const dispatch =
        useDispatch();


    /*
    |--------------------------------------------------------------------------
    | ORDER STATE
    |--------------------------------------------------------------------------
    */

    const orderAlreadyCreated =
        Boolean(
            prescription
                ?.order
                ?._id
        ) ||

        prescription?.status ===
            "order_created" ||

        prescription?.status ===
            "completed";


    const isRejected =
        prescription?.status ===
        "rejected";


    const isCompleted =
        prescription?.status ===
        "completed";


    /*
    |--------------------------------------------------------------------------
    | CAN EDIT ORDER
    |--------------------------------------------------------------------------
    |
    | Created orders remain editable.
    |
    | Completed / rejected requests are locked.
    |
    */

    const canEditOrder =
        !isRejected &&
        !isCompleted;


    /*
    |--------------------------------------------------------------------------
    | PRESCRIPTION VIEWER
    |--------------------------------------------------------------------------
    */

    const [
        currentPage,
        setCurrentPage,
    ] =
        useState(
            0
        );


    const [
        zoom,
        setZoom,
    ] =
        useState(
            100
        );


    const [
        rotation,
        setRotation,
    ] =
        useState(
            0
        );


    /*
    |--------------------------------------------------------------------------
    | ORDER ITEMS
    |--------------------------------------------------------------------------
    */

    const [
        orderItems,
        setOrderItems,
    ] =
        useState(
            () =>
                buildInitialOrderItems(
                    prescription,
                    medicines
                )
        );


    /*
    |--------------------------------------------------------------------------
    | MEDICINE SEARCH
    |--------------------------------------------------------------------------
    */

    const [
        medicineSearch,
        setMedicineSearch,
    ] =
        useState(
            ""
        );

    const [catalogMedicines, setCatalogMedicines] =
        useState([]);

    useEffect(() => {
        fetch('/data/medicines-catalog.json')
            .then((response) => response.ok ? response.json() : [])
            .then((data) => {
                if (Array.isArray(data)) setCatalogMedicines(data);
            })
            .catch(() => {
                // Keep the server-provided list as a selector fallback.
            });
    }, []);


    /*
    |--------------------------------------------------------------------------
    | DELIVERY FEE
    |--------------------------------------------------------------------------
    */

    const [
        deliveryFee,
        setDeliveryFee,
    ] =
        useState(

            prescription
                ?.order
                ?.deliveryFee ??

            50

        );


    /*
    |--------------------------------------------------------------------------
    | ADMIN NOTE
    |--------------------------------------------------------------------------
    */

    const [
        adminNote,
        setAdminNote,
    ] =
        useState(

            prescription
                ?.order
                ?.adminNote ||

            prescription
                ?.internalNote ||

            ""

        );


    /*
    |--------------------------------------------------------------------------
    | REJECTION
    |--------------------------------------------------------------------------
    */

    const [
        rejectReason,
        setRejectReason,
    ] =
        useState(
            ""
        );


    const [
        showRejectModal,
        setShowRejectModal,
    ] =
        useState(
            false
        );


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const [
        submitting,
        setSubmitting,
    ] =
        useState(
            false
        );


    /*
    |--------------------------------------------------------------------------
    | CURRENT FILE
    |--------------------------------------------------------------------------
    */

    const currentFile =
        prescription
            ?.files
            ?.[currentPage];


    /*
    |--------------------------------------------------------------------------
    | FILTER MEDICINES
    |--------------------------------------------------------------------------
    */

    const filteredCatalog =
        useMemo(
            () => {

                const query =
                    medicineSearch
                        .trim()
                        .toLowerCase();


                if (!query) {

                    return [];

                }


                const source = catalogMedicines.length
                    ? catalogMedicines
                    : medicines;

                return source

                    .filter(
                        (
                            medicine
                        ) => {

                            return (

                                medicine
                                    .name
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    ) ||

                                medicine
                                    .genericName
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    ) ||

                                medicine
                                    .strength
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    )

                            );

                        }
                    )

                    .slice(
                        0,
                        15
                    );

            },
            [
                medicineSearch,
                catalogMedicines,
                medicines,
            ]
        );


    /*
    |--------------------------------------------------------------------------
    | CALCULATIONS
    |--------------------------------------------------------------------------
    */

    const subtotal =
        orderItems.reduce(
            (
                total,
                item
            ) =>

                total +

                Number(
                    item.price ||
                    0
                ) *

                Number(
                    item.quantity ||
                    0
                ),

            0
        );


    const total =
        subtotal +

        Number(
            deliveryFee ||
            0
        );


    /*
    |--------------------------------------------------------------------------
    | ADD MEDICINE
    |--------------------------------------------------------------------------
    */

    const addMedicine = (
        medicine
    ) => {

        if (
            !canEditOrder
        ) {

            return;

        }


        setOrderItems(
            (
                previous
            ) => {

                const existing =
                    previous.find(
                        (
                            item
                        ) =>

                            String(
                                item.id
                            ) ===
                            String(
                                medicine._id
                            )
                    );


                /*
                |--------------------------------------------------------------------------
                | ALREADY EXISTS → INCREASE
                |--------------------------------------------------------------------------
                */

                if (
                    existing
                ) {

                    return previous.map(
                        (
                            item
                        ) =>

                            String(
                                item.id
                            ) ===
                            String(
                                medicine._id
                            )

                                ? {

                                    ...item,

                                    quantity:
                                        Number(
                                            item.quantity
                                        ) +
                                        1,

                                }

                                : item
                    );

                }


                /*
                |--------------------------------------------------------------------------
                | ADD NEW
                |--------------------------------------------------------------------------
                */

                return [

                    ...previous,

                    {

                        id:
                            String(
                                medicine._id
                            ),

                        name:
                            medicine.name ||
                            "",

                        genericName:
                            medicine.genericName ||
                            "",

                        strength:
                            medicine.strength ||
                            "",

                        unit:
                            medicine.unit ||
                            "",

                        price:
                            Number(
                                medicine.price ||
                                0
                            ),

                        quantity:
                            1,

                    },

                ];

            }
        );


        setMedicineSearch(
            ""
        );

    };


    /*
    |--------------------------------------------------------------------------
    | INCREASE
    |--------------------------------------------------------------------------
    */

    const increaseQuantity = (
        id
    ) => {

        if (
            !canEditOrder
        ) {

            return;

        }


        setOrderItems(
            (
                previous
            ) =>

                previous.map(
                    (
                        item
                    ) =>

                        item.id ===
                        id

                            ? {

                                ...item,

                                quantity:
                                    Number(
                                        item.quantity
                                    ) +
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

    const decreaseQuantity = (
        id
    ) => {

        if (
            !canEditOrder
        ) {

            return;

        }


        setOrderItems(
            (
                previous
            ) =>

                previous

                    .map(
                        (
                            item
                        ) =>

                            item.id ===
                            id

                                ? {

                                    ...item,

                                    quantity:
                                        Number(
                                            item.quantity
                                        ) -
                                        1,

                                }

                                : item
                    )

                    .filter(
                        (
                            item
                        ) =>
                            item.quantity >
                            0
                    )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | REMOVE MEDICINE
    |--------------------------------------------------------------------------
    */

    const removeMedicine = (
        id
    ) => {

        if (
            !canEditOrder
        ) {

            return;

        }


        setOrderItems(
            (
                previous
            ) =>

                previous.filter(
                    (
                        item
                    ) =>
                        item.id !==
                        id
                )
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE ORDER
    |--------------------------------------------------------------------------
    */

    const handleSaveOrder =
        async () => {

            /*
            |--------------------------------------------------------------------------
            | LOCKED
            |--------------------------------------------------------------------------
            */

            if (
                !canEditOrder
            ) {

                dispatch(
                    showSnackBar({

                        message:
                            "This order can no longer be edited.",

                        option: {
                            variant:
                                "error",
                        },

                    })
                );


                return;

            }


            /*
            |--------------------------------------------------------------------------
            | ITEMS REQUIRED
            |--------------------------------------------------------------------------
            */

            if (
                !orderItems.length
            ) {

                dispatch(
                    showSnackBar({

                        message:
                            "Please add at least one medicine.",

                        option: {
                            variant:
                                "error",
                        },

                    })
                );


                return;

            }


            /*
            |--------------------------------------------------------------------------
            | PAYLOAD
            |--------------------------------------------------------------------------
            */

            const payload = {

                items:
                    orderItems.map(
                        (
                            item
                        ) => ({

                            medicine:
                                item.id,

                            quantity:
                                Number(
                                    item.quantity
                                ),

                        })
                    ),


                deliveryFee:
                    Number(
                        deliveryFee ||
                        0
                    ),


                adminNote:
                    adminNote.trim(),

            };


            try {

                setSubmitting(
                    true
                );


                let response;


                /*
                |--------------------------------------------------------------------------
                | UPDATE EXISTING ORDER
                |--------------------------------------------------------------------------
                */

                if (
                    orderAlreadyCreated
                ) {

                    response =
                        await axios.patch(

                            `/api/admin/prescriptions/${router.query.id}/create-order`,

                            payload

                        );

                }


                /*
                |--------------------------------------------------------------------------
                | CREATE NEW ORDER
                |--------------------------------------------------------------------------
                */

                else {

                    response =
                        await axios.post(

                            `/api/admin/prescriptions/${router.query.id}/create-order`,

                            payload

                        );

                }


                /*
                |--------------------------------------------------------------------------
                | VALIDATE RESPONSE
                |--------------------------------------------------------------------------
                */

                if (
                    !response
                        ?.data
                        ?.success
                ) {

                    throw new Error(

                        response
                            ?.data
                            ?.message ||

                        orderAlreadyCreated

                            ? "Failed to update order."

                            : "Failed to create order."

                    );

                }


                /*
                |--------------------------------------------------------------------------
                | SUCCESS MESSAGE
                |--------------------------------------------------------------------------
                */

                dispatch(
                    showSnackBar({

                        message:
                            orderAlreadyCreated

                                ? "Order updated successfully."

                                : `Order created successfully. Tracking: ${
                                    response
                                        ?.data
                                        ?.order
                                        ?.trackingNumber ||
                                    "N/A"
                                }`,

                        option: {
                            variant:
                                "success",
                        },

                    })
                );


                /*
                |--------------------------------------------------------------------------
                | REFRESH PAGE
                |--------------------------------------------------------------------------
                |
                | Keeps admin on the same review page.
                |
                | After creation:
                | Create Order → Update Order
                |
                */

                await router.replace(
                    router.asPath
                );


            } catch (
                error
            ) {

                console.error(
                    orderAlreadyCreated
                        ? "Update order error:"
                        : "Create order error:",
                    error
                        ?.response
                        ?.data ||
                    error
                );


                dispatch(
                    showSnackBar({

                        message:

                            error
                                ?.response
                                ?.data
                                ?.message ||

                            error
                                ?.message ||

                            (
                                orderAlreadyCreated

                                    ? "Failed to update order."

                                    : "Failed to create order."
                            ),

                        option: {
                            variant:
                                "error",
                        },

                    })
                );


            } finally {

                setSubmitting(
                    false
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | REJECT
    |--------------------------------------------------------------------------
    */

    const handleReject =
        async () => {

            /*
            |--------------------------------------------------------------------------
            | ORDER ALREADY CREATED
            |--------------------------------------------------------------------------
            */

            if (
                orderAlreadyCreated
            ) {

                dispatch(
                    showSnackBar({

                        message:
                            "An order has already been created for this prescription.",

                        option: {
                            variant:
                                "error",
                        },

                    })
                );


                return;

            }


            /*
            |--------------------------------------------------------------------------
            | REASON
            |--------------------------------------------------------------------------
            */

            if (
                !rejectReason.trim()
            ) {

                dispatch(
                    showSnackBar({

                        message:
                            "Please provide a reason for rejection.",

                        option: {
                            variant:
                                "error",
                        },

                    })
                );


                return;

            }


            try {

                setSubmitting(
                    true
                );


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


                if (
                    !response
                        .data
                        ?.success
                ) {

                    throw new Error(

                        response
                            .data
                            ?.message ||

                        "Failed to reject prescription."

                    );

                }


                setShowRejectModal(
                    false
                );


                dispatch(
                    showSnackBar({

                        message:
                            "Prescription rejected successfully.",

                        option: {
                            variant:
                                "success",
                        },

                    })
                );


                router.push(
                    "/admin/prescriptions"
                );


            } catch (
                error
            ) {

                console.error(
                    "Reject prescription error:",
                    error
                );


                dispatch(
                    showSnackBar({

                        message:

                            error
                                ?.response
                                ?.data
                                ?.message ||

                            error
                                ?.message ||

                            "Failed to reject prescription.",

                        option: {
                            variant:
                                "error",
                        },

                    })
                );


            } finally {

                setSubmitting(
                    false
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD
    |--------------------------------------------------------------------------
    */

    const handleDownload =
        () => {

            if (
                !currentFile?.url
            ) {

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

    if (
        !prescription
    ) {

        return (

            <>

                <Head>

                    <title>
                        Prescription Not Found | MediLocate
                    </title>

                </Head>


                <main
                    className={
                        styles.notFound
                    }
                >

                    <DescriptionOutlinedIcon />


                    <h1>
                        Prescription request not found
                    </h1>


                    <p>
                        The request you're looking for does not exist.
                    </p>


                    <Link
                        href="/admin/prescriptions"
                    >

                        <ArrowBackRoundedIcon />

                        Back to Requests

                    </Link>

                </main>

            </>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const statusMeta =
        getStatusMeta(
            prescription.status
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <>

            <Head>

                <title>

                    {
                        prescription
                            .requestCode
                    }

                    {" | "}

                    Prescription Review

                </title>

            </Head>


            <main
                className={
                    styles.page
                }
            >

                <div
                    className={
                        styles.container
                    }
                >


                    {/* =====================================================
                        TOP BAR
                    ====================================================== */}

                    <div
                        className={
                            styles.topBar
                        }
                    >

                        <Link
                            href="/admin/prescriptions"
                            className={
                                styles.backLink
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Prescription Requests

                        </Link>


                        <div
                            className={
                                styles.requestMeta
                            }
                        >

                            <span>

                                {
                                    prescription
                                        .requestCode
                                }

                            </span>


                            <span
                                className={
                                    styles.pendingBadge
                                }
                            >

                                {
                                    statusMeta
                                        .label
                                }

                            </span>

                        </div>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header
                        className={
                            styles.pageHeader
                        }
                    >

                        <div>

                            <span>
                                PRESCRIPTION REVIEW
                            </span>


                            <h1>

                                {
                                    orderAlreadyCreated

                                        ? "Review & update order"

                                        : "Review request"
                                }

                            </h1>


                            <p>

                                {
                                    orderAlreadyCreated

                                        ? "Review the created order. You can add or remove medicines, change quantities and update the order."

                                        : "Review the prescription, identify the medicines and create the patient's medicine order."
                                }

                            </p>

                        </div>


                        <div
                            className={
                                styles.headerActions
                            }
                        >

                            {/* REJECT */}

                            {
                                !orderAlreadyCreated &&
                                !isRejected &&
                                !isCompleted && (

                                    <button
                                        type="button"
                                        className={
                                            styles.rejectButton
                                        }
                                        onClick={
                                            () =>
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

                                )
                            }


                            {/* CREATE / UPDATE */}

                            {
                                canEditOrder && (

                                    <button
                                        type="button"
                                        className={
                                            styles.createTopButton
                                        }
                                        onClick={
                                            handleSaveOrder
                                        }
                                        disabled={
                                            submitting ||
                                            !orderItems.length
                                        }
                                    >

                                        {
                                            orderAlreadyCreated

                                                ? <EditOutlinedIcon />

                                                : <ShoppingBagOutlinedIcon />
                                        }


                                        {
                                            submitting

                                                ? (
                                                    orderAlreadyCreated
                                                        ? "Updating..."
                                                        : "Creating..."
                                                )

                                                : (
                                                    orderAlreadyCreated
                                                        ? "Update Order"
                                                        : "Create Order"
                                                )
                                        }

                                    </button>

                                )
                            }

                        </div>

                    </header>


                    {/* =====================================================
                        GRID
                    ====================================================== */}

                    <div
                        className={
                            styles.mainGrid
                        }
                    >


                        {/* =================================================
                            PRESCRIPTION VIEWER
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
                                                ?.length ||
                                            0
                                        }

                                        {" "}

                                        {
                                            prescription
                                                .files
                                                ?.length ===
                                            1
                                                ? "page"
                                                : "pages"
                                        }

                                    </span>

                                </div>


                                {/* VIEWER TOOLS */}

                                <div
                                    className={
                                        styles.viewerTools
                                    }
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            () =>
                                                setZoom(
                                                    Math.max(
                                                        50,
                                                        zoom -
                                                            10
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
                                        onClick={
                                            () =>
                                                setZoom(
                                                    Math.min(
                                                        180,
                                                        zoom +
                                                            10
                                                    )
                                                )
                                        }
                                        aria-label="Zoom in"
                                    >

                                        <ZoomInOutlinedIcon />

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            () =>
                                                setRotation(
                                                    (
                                                        rotation +
                                                        90
                                                    ) %
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

                                    {
                                        currentFile?.url ? (

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
                                                    Prescription preview
                                                </span>

                                            </div>

                                        )
                                    }

                                </div>

                            </div>


                            {/* THUMBNAILS */}

                            <div
                                className={
                                    styles.thumbnails
                                }
                            >

                                {
                                    (
                                        prescription
                                            .files ||
                                        []
                                    ).map(
                                        (
                                            file,
                                            index
                                        ) => (

                                            <button
                                                type="button"
                                                key={
                                                    file._id ||
                                                    file.publicId ||
                                                    index
                                                }
                                                onClick={
                                                    () =>
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

                                                {
                                                    file.url ? (

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

                                                    )
                                                }


                                                <span>
                                                    {index + 1}
                                                </span>

                                            </button>

                                        )
                                    )
                                }

                            </div>

                        </section>


                        {/* =================================================
                            SIDEBAR
                        ================================================== */}

                        <aside
                            className={
                                styles.sidebar
                            }
                        >


                            {/* =================================================
                                PATIENT
                            ================================================== */}

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

                                    {/* NAME */}

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


                                    {/* PHONE */}

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


                                    {/* ADDRESS */}

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

                                                        .filter(
                                                            Boolean
                                                        )

                                                        .join(
                                                            ", "
                                                        ) ||

                                                    "N/A"
                                                }

                                            </strong>

                                        </div>

                                    </div>


                                    {/* CREATED */}

                                    <div>

                                        <CalendarTodayOutlinedIcon />


                                        <div>

                                            <span>
                                                Submitted
                                            </span>


                                            <strong>

                                                {
                                                    formatDate(
                                                        prescription
                                                            .createdAt
                                                    )
                                                }

                                            </strong>

                                        </div>

                                    </div>

                                </div>


                                {/* NOTE */}

                                {
                                    prescription
                                        .notes && (

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
                                                        prescription
                                                            .notes
                                                    }

                                                </p>

                                            </div>

                                        </div>

                                    )
                                }

                            </section>


                            {/* =================================================
                                MEDICINES
                            ================================================== */}

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

                                            {
                                                orderAlreadyCreated

                                                    ? "Order medicines"

                                                    : "Add medicines"
                                            }

                                        </h2>


                                        <span>

                                            {
                                                orderAlreadyCreated

                                                    ? "Add, remove or change medicine quantities"

                                                    : "Identify medicines from prescription"
                                            }

                                        </span>

                                    </div>

                                </div>


                                {/* =================================================
                                    SEARCH
                                ================================================== */}

                                {
                                    canEditOrder && (

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
                                                onChange={
                                                    (
                                                        event
                                                    ) =>
                                                        setMedicineSearch(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                }
                                                placeholder="Search medicine..."
                                            />

                                        </div>

                                    )
                                }


                                {/* =================================================
                                    SEARCH RESULT
                                ================================================== */}

                                {
                                    canEditOrder &&
                                    medicineSearch && (

                                        <div
                                            className={
                                                styles.catalogResults
                                            }
                                        >

                                            {
                                                filteredCatalog.length >
                                                0 ? (

                                                    filteredCatalog.map(
                                                        (
                                                            medicine
                                                        ) => (

                                                            <button
                                                                type="button"
                                                                key={
                                                                    medicine._id
                                                                }
                                                                onClick={
                                                                    () =>
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
                                                                            medicine.genericName ||
                                                                            "N/A"
                                                                        }

                                                                        {
                                                                            medicine.strength

                                                                                ? ` • ${medicine.strength}`

                                                                                : ""
                                                                        }

                                                                    </span>

                                                                </div>


                                                                <span>

                                                                    ৳

                                                                    {
                                                                        Number(
                                                                            medicine.price ||
                                                                            0
                                                                        )
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

                                                )
                                            }

                                        </div>

                                    )
                                }


                                {/* =================================================
                                    ITEMS
                                ================================================== */}

                                <div
                                    className={
                                        styles.orderItems
                                    }
                                >

                                    {
                                        orderItems.length ===
                                        0 ? (

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
                                                (
                                                    item
                                                ) => (

                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        className={
                                                            styles.orderItem
                                                        }
                                                    >

                                                        {/* INFO */}

                                                        <div
                                                            className={
                                                                styles.itemInfo
                                                            }
                                                        >

                                                            <strong>

                                                                {
                                                                    item.name ||
                                                                    "Medicine"
                                                                }

                                                            </strong>


                                                            <span>

                                                                {
                                                                    item.genericName ||
                                                                    "N/A"
                                                                }


                                                                {
                                                                    item.strength

                                                                        ? ` • ${item.strength}`

                                                                        : ""
                                                                }

                                                            </span>


                                                            <small>

                                                                ৳
                                                                {
                                                                    Number(
                                                                        item.price ||
                                                                        0
                                                                    )
                                                                }

                                                                {
                                                                    item.unit

                                                                        ? ` / ${item.unit}`

                                                                        : " / unit"
                                                                }

                                                            </small>

                                                        </div>


                                                        {/* ACTION */}

                                                        <div
                                                            className={
                                                                styles.itemActions
                                                            }
                                                        >

                                                            {/* QUANTITY */}

                                                            {
                                                                canEditOrder ? (

                                                                    <div
                                                                        className={
                                                                            styles.quantity
                                                                        }
                                                                    >

                                                                        <button
                                                                            type="button"
                                                                            onClick={
                                                                                () =>
                                                                                    decreaseQuantity(
                                                                                        item.id
                                                                                    )
                                                                            }
                                                                            aria-label="Decrease quantity"
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
                                                                            onClick={
                                                                                () =>
                                                                                    increaseQuantity(
                                                                                        item.id
                                                                                    )
                                                                            }
                                                                            aria-label="Increase quantity"
                                                                        >

                                                                            <AddRoundedIcon />

                                                                        </button>

                                                                    </div>

                                                                ) : (

                                                                    <div
                                                                        className={
                                                                            styles.quantity
                                                                        }
                                                                    >

                                                                        <strong>

                                                                            Qty:{" "}

                                                                            {
                                                                                item.quantity
                                                                            }

                                                                        </strong>

                                                                    </div>

                                                                )
                                                            }


                                                            {/* TOTAL */}

                                                            <strong
                                                                className={
                                                                    styles.itemTotal
                                                                }
                                                            >

                                                                ৳

                                                                {
                                                                    Number(
                                                                        item.price ||
                                                                        0
                                                                    ) *

                                                                    Number(
                                                                        item.quantity ||
                                                                        0
                                                                    )
                                                                }

                                                            </strong>


                                                            {/* REMOVE */}

                                                            {
                                                                canEditOrder && (

                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.removeItem
                                                                        }
                                                                        onClick={
                                                                            () =>
                                                                                removeMedicine(
                                                                                    item.id
                                                                                )
                                                                        }
                                                                        aria-label="Remove medicine"
                                                                    >

                                                                        <DeleteOutlineRoundedIcon />

                                                                    </button>

                                                                )
                                                            }

                                                        </div>

                                                    </div>

                                                )
                                            )

                                        )
                                    }

                                </div>

                            </section>


                            {/* =================================================
                                ORDER SUMMARY
                            ================================================== */}

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

                                            {
                                                orderAlreadyCreated

                                                    ? "Edit and update this order"

                                                    : "Review before creating order"
                                            }

                                        </span>

                                    </div>

                                </div>


                                {/* SUMMARY */}

                                <div
                                    className={
                                        styles.summaryRows
                                    }
                                >

                                    {/* MEDICINE TOTAL */}

                                    <div>

                                        <span>
                                            Medicines
                                        </span>


                                        <strong>
                                            ৳{subtotal}
                                        </strong>

                                    </div>


                                    {/* DELIVERY */}

                                    <div>

                                        <span>
                                            Delivery fee
                                        </span>


                                        {
                                            canEditOrder ? (

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
                                                        onChange={
                                                            (
                                                                event
                                                            ) =>
                                                                setDeliveryFee(
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                        }
                                                    />

                                                </div>

                                            ) : (

                                                <strong>

                                                    ৳
                                                    {
                                                        Number(
                                                            deliveryFee ||
                                                            0
                                                        )
                                                    }

                                                </strong>

                                            )
                                        }

                                    </div>

                                </div>


                                {/* TOTAL */}

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


                                {/* =================================================
                                    ADMIN NOTE
                                ================================================== */}

                                {
                                    canEditOrder && (

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
                                                onChange={
                                                    (
                                                        event
                                                    ) =>
                                                        setAdminNote(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                }
                                                placeholder="Optional note for this order..."
                                            />

                                        </div>

                                    )
                                }


                                {/* =================================================
                                    SAVE BUTTON
                                ================================================== */}

                                {
                                    canEditOrder ? (

                                        <>

                                            <button
                                                type="button"
                                                className={
                                                    styles.createOrderButton
                                                }
                                                onClick={
                                                    handleSaveOrder
                                                }
                                                disabled={
                                                    submitting ||
                                                    !orderItems.length
                                                }
                                            >

                                                {
                                                    orderAlreadyCreated

                                                        ? <EditOutlinedIcon />

                                                        : <CheckCircleRoundedIcon />
                                                }


                                                {
                                                    submitting

                                                        ? (
                                                            orderAlreadyCreated
                                                                ? "Updating order..."
                                                                : "Creating order..."
                                                        )

                                                        : (
                                                            orderAlreadyCreated
                                                                ? "Update Order"
                                                                : "Create Order"
                                                        )
                                                }


                                                {
                                                    !submitting && (

                                                        <ArrowForwardRoundedIcon />

                                                    )
                                                }

                                            </button>


                                            <p
                                                className={
                                                    styles.createNote
                                                }
                                            >

                                                {
                                                    orderAlreadyCreated ? (

                                                        <>

                                                            Changes to medicines,
                                                            quantities and delivery
                                                            fee will update order{" "}

                                                            <strong>

                                                                {
                                                                    prescription
                                                                        ?.order
                                                                        ?.trackingNumber ||
                                                                    ""
                                                                }

                                                            </strong>

                                                            .

                                                        </>

                                                    ) : (

                                                        <>

                                                            Creating the order will
                                                            move this prescription
                                                            request to{" "}

                                                            <strong>
                                                                Order Created
                                                            </strong>

                                                            {" "}status.

                                                        </>

                                                    )
                                                }

                                            </p>

                                        </>

                                    ) : (

                                        <>

                                            <button
                                                type="button"
                                                className={
                                                    styles.createOrderButton
                                                }
                                                disabled
                                            >

                                                {
                                                    isRejected

                                                        ? <CloseRoundedIcon />

                                                        : <CheckCircleRoundedIcon />
                                                }


                                                {
                                                    isRejected

                                                        ? "Request Rejected"

                                                        : "Order Completed"
                                                }

                                            </button>

                                        </>

                                    )
                                }

                            </section>

                        </aside>

                    </div>

                </div>

            </main>


            {/* =====================================================
                REJECT MODAL
            ====================================================== */}

            {
                showRejectModal && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                        onClick={
                            () =>
                                setShowRejectModal(
                                    false
                                )
                        }
                    >

                        <div
                            className={
                                styles.rejectModal
                            }
                            onClick={
                                (
                                    event
                                ) =>
                                    event.stopPropagation()
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.modalClose
                                }
                                onClick={
                                    () =>
                                        setShowRejectModal(
                                            false
                                        )
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
                                onChange={
                                    (
                                        event
                                    ) =>
                                        setRejectReason(
                                            event
                                                .target
                                                .value
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
                                    onClick={
                                        () =>
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

                                    {
                                        submitting

                                            ? "Rejecting..."

                                            : "Reject Request"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </>

    );

}


/*
|--------------------------------------------------------------------------
| SERVER SIDE
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    const {
        params,
    } =
        context;


    const id =
        params?.id;


    if (
        !id
    ) {

        return {

            notFound:
                true,

        };

    }


    try {

        /*
        |--------------------------------------------------------------------------
        | DATABASE
        |--------------------------------------------------------------------------
        */

        const db =
            (
                await import(
                    "@/database/connection"
                )
            ).default;


        const Prescription =
            (
                await import(
                    "@/database/model/Prescription"
                )
            ).default;


        /*
        |--------------------------------------------------------------------------
        | REGISTER ORDER MODEL
        |--------------------------------------------------------------------------
        */

        const Order =
            (
                await import(
                    "@/database/model/Orders"
                )
            ).default;


        const Medicine =
            (
                await import(
                    "@/database/model/Medicine"
                )
            ).default;


        await db.connect();


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        const prescription =
            await Prescription

                .findById(
                    id
                )

                .populate(
                    "user",
                    "name phone email"
                )

                .populate(
                    "order",

                    [
                        "_id",
                        "orderId",
                        "trackingNumber",
                        "status",
                        "items",
                        "subtotal",
                        "deliveryFee",
                        "total",
                        "adminNote",
                        "createdAt",
                    ].join(
                        " "
                    )
                )

                .lean();


        if (
            !prescription
        ) {

            await db.disconnect();


            return {

                notFound:
                    true,

            };

        }


        /*
        |--------------------------------------------------------------------------
        | ORDER / PRESCRIPTION MEDICINE IDS
        |--------------------------------------------------------------------------
        */

        const existingOrderItems =
            prescription
                ?.order
                ?.items;


        const prescriptionItems =
            prescription
                ?.medicines;


        const sourceItems =
            Array.isArray(
                existingOrderItems
            ) &&
                existingOrderItems.length

                ? existingOrderItems

                : Array.isArray(
                    prescriptionItems
                )

                    ? prescriptionItems

                    : [];


        const medicineIds =
            sourceItems

                .map(
                    (
                        item
                    ) => {

                        const medicineValue =
                            item?.medicine ??
                            item?.medicineId ??
                            item?.id;


                        if (
                            medicineValue &&
                            typeof medicineValue ===
                            "object"
                        ) {

                            return medicineValue
                                ?._id;

                        }


                        return medicineValue;

                    }
                )

                .filter(
                    Boolean
                );


        /*
        |--------------------------------------------------------------------------
        | ASSOCIATED MEDICINES ONLY
        |--------------------------------------------------------------------------
        */

        const medicines =
            medicineIds.length

                ? await Medicine

                    .find({

                        _id: {

                            $in:
                                medicineIds,

                        },

                    })

                    .select(

                        [
                            "name",
                            "genericName",
                            "strength",
                            "unit",
                            "price",
                            "prescriptionRequired",
                            "status",
                        ].join(
                            " "
                        )

                    )

                    .lean()

                : [];


        /*
        |--------------------------------------------------------------------------
        | SERIALIZE
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


        await db.disconnect();


        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return {

            props: {

                prescription:
                    serializedPrescription,

                medicines:
                    serializedMedicines,

            },

        };


    } catch (
        error
    ) {

        console.error(
            "Prescription review SSR error:",
            error
        );


        return {

            props: {

                prescription:
                    null,

                medicines:
                    [],

                error:
                    error?.message ||
                    "Failed to load prescription",

            },

        };

    }

}