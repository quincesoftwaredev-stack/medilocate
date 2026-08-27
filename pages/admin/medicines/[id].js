import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

import axios from "axios";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";


import styles from "@/styles/Admin/Medicines/MedicineForm.module.css";

import { useSelector } from "react-redux";
/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const categories = [
    "Pain Relief",
    "Gastrointestinal",
    "Cardiovascular",
    "Antibiotic",
    "Antihistamine",
    "Vitamins",
    "Diabetes",
    "Respiratory",
    "Dermatology",
    "Other",
];


const dosageForms = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Suspension",
    "Injection",
    "Cream",
    "Ointment",
    "Drops",
    "Inhaler",
    "Powder",
    "Other",
];


export default function ManageMedicinePage(
    props
) {

    const router = useRouter();
const userInfo =
    useSelector(
        (state) =>
            state.user?.userInfo
    );

    /*
    |--------------------------------------------------------------------------
    | SERVER DATA
    |--------------------------------------------------------------------------
    */

    const medicine =
        props.medicine;


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const [form, setForm] = useState({

        name:
            medicine?.name || "",

        genericName:
            medicine?.genericName || "",

        strength:
            medicine?.strength || "",

        dosageForm:
            medicine?.dosageForm ||
            "Tablet",

        packSize:
            medicine?.packSize || "",

        manufacturer:
            medicine?.manufacturer || "",

        category:
            medicine?.category || "",

        price:
            medicine?.price ?? "",

        /*
         * Stock is displayed here,
         * but it is NOT submitted through
         * Save Changes.
         */

        stock:
            medicine?.stock ?? 0,

        reorderLevel:
            medicine?.reorderLevel ?? 20,

        prescriptionRequired:
            Boolean(
                medicine?.prescriptionRequired
            ),

        description:
            medicine?.description || "",

        usage:
            medicine?.usage || "",

        warnings:
            medicine?.warnings || "",

        status:
            medicine?.status ||
            "active",

    });


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    |
    | Keep actual medicine image object separately.
    |
    */

    const [image, setImage] =
        useState(
            medicine?.image || {
                url: "",
                publicId: "",
            }
        );


    /*
    |--------------------------------------------------------------------------
    | LOCAL IMAGE PREVIEW
    |--------------------------------------------------------------------------
    */

    const [imagePreview, setImagePreview] =
        useState(
            medicine?.image?.url ||
            ""
        );


    /*
    |--------------------------------------------------------------------------
    | UI STATE
    |--------------------------------------------------------------------------
    */

    const [saving, setSaving] =
        useState(false);


    const [stockAdjustment, setStockAdjustment] =
        useState("");


    const [adjustmentType, setAdjustmentType] =
        useState("add");


    const [adjustingStock, setAdjustingStock] =
        useState(false);


    const [showDeactivate, setShowDeactivate] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    |
    | This follows your existing Redux token pattern.
    |
    */

    // You can add useSelector here when your auth
    // implementation is available in this page.


    /*
    |--------------------------------------------------------------------------
    | NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!medicine) {

        return (
            <>

                <Head>

                    <title>
                        Medicine Not Found | MediLocate Admin
                    </title>

                </Head>




                <main
                    className={
                        styles.notFound
                    }
                >

                    <MedicalServicesOutlinedIcon />

                    <h1>
                        Medicine not found
                    </h1>

                    <p>
                        The medicine you're looking for
                        does not exist.
                    </p>


                    <Link
                        href="/admin/medicines"
                    >

                        <ArrowBackRoundedIcon />

                        Back to Medicines

                    </Link>

                </main>



            </>
        );

    }


    /*
    |--------------------------------------------------------------------------
    | HANDLE CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;


        setForm(
            (previous) => ({

                ...previous,

                [name]:
                    type === "checkbox"
                        ? checked
                        : value,

            })
        );

    };


    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    |
    | NOTE:
    | This only creates a local preview.
    |
    | Your current medicine API expects:
    |
    | image: {
    |     url,
    |     publicId
    | }
    |
    | So an actual upload endpoint should eventually
    | upload the file first and then update image.
    |
    */

    const handleImage = (
        event
    ) => {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        const previewUrl =
            URL.createObjectURL(
                file
            );


        setImagePreview(
            previewUrl
        );


        /*
         * Do NOT send this local blob URL
         * as the permanent medicine image.
         *
         * Keep the existing image until the
         * actual upload endpoint is connected.
         */

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE MEDICINE
    |--------------------------------------------------------------------------
    */

    const handleSave = async (
        event
    ) => {

        event.preventDefault();


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
            !form.name.trim()
        ) {

            alert(
                "Medicine name is required."
            );

            return;

        }


        if (
            !form.genericName.trim()
        ) {

            alert(
                "Generic name is required."
            );

            return;

        }


        if (
            form.price === "" ||
            Number(form.price) < 0
        ) {

            alert(
                "Please enter a valid price."
            );

            return;

        }


        try {

            setSaving(true);


            /*
            |--------------------------------------------------------------------------
            | PAYLOAD
            |--------------------------------------------------------------------------
            |
            | Stock intentionally excluded.
            |
            */

            const payload = {

                name:
                    form.name.trim(),

                genericName:
                    form.genericName.trim(),

                strength:
                    form.strength?.trim() ||
                    "",

                dosageForm:
                    form.dosageForm,

                packSize:
                    form.packSize?.trim() ||
                    "",

                manufacturer:
                    form.manufacturer?.trim() ||
                    "",

                category:
                    form.category ||
                    "Other",

                price:
                    Number(
                        form.price
                    ),

                reorderLevel:
                    Math.max(
                        Number(
                            form.reorderLevel
                        ) || 0,
                        0
                    ),

                prescriptionRequired:
                    Boolean(
                        form.prescriptionRequired
                    ),

                description:
                    form.description?.trim() ||
                    "",

                usage:
                    form.usage?.trim() ||
                    "",

                warnings:
                    form.warnings?.trim() ||
                    "",

                /*
                 * Keep current stored image.
                 */

                image:
                    image || {
                        url: "",
                        publicId: "",
                    },

                status:
                    form.status,

            };


            /*
            |--------------------------------------------------------------------------
            | API
            |--------------------------------------------------------------------------
            */

            const {
                data
            } = await axios.put(

                `/api/admin/medicines/${medicine._id}`,

                payload,

                {
                    headers: {
                        Authorization:
                            `Bearer ${userInfo?.token}`
                    }
                }

            );


            /*
            |--------------------------------------------------------------------------
            | UPDATE LOCAL STATE FROM SERVER
            |--------------------------------------------------------------------------
            */

            if (data) {

                setForm(
                    (previous) => ({

                        ...previous,

                        name:
                            data.name ??
                            previous.name,

                        genericName:
                            data.genericName ??
                            previous.genericName,

                        strength:
                            data.strength ??
                            previous.strength,

                        dosageForm:
                            data.dosageForm ??
                            previous.dosageForm,

                        packSize:
                            data.packSize ??
                            previous.packSize,

                        manufacturer:
                            data.manufacturer ??
                            previous.manufacturer,

                        category:
                            data.category ??
                            previous.category,

                        price:
                            data.price ??
                            previous.price,

                        stock:
                            data.stock ??
                            previous.stock,

                        reorderLevel:
                            data.reorderLevel ??
                            previous.reorderLevel,

                        prescriptionRequired:
                            Boolean(
                                data.prescriptionRequired
                            ),

                        description:
                            data.description ??
                            previous.description,

                        usage:
                            data.usage ??
                            previous.usage,

                        warnings:
                            data.warnings ??
                            previous.warnings,

                        status:
                            data.status ??
                            previous.status,

                    })
                );


                setImage(
                    data.image || {
                        url: "",
                        publicId: "",
                    }
                );


                setImagePreview(
                    data.image?.url ||
                    ""
                );

            }


            alert(
                "Medicine updated successfully."
            );


        } catch (error) {

            console.error(
                "Update medicine error:",
                error
            );


            alert(
                error
                    ?.response
                    ?.data
                    ?.message ||
                "Failed to update medicine."
            );


        } finally {

            setSaving(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | STOCK ADJUSTMENT
    |--------------------------------------------------------------------------
    */

    const handleStockAdjustment =
        async () => {

            const amount =
                Number(
                    stockAdjustment
                );


            if (
                !Number.isInteger(
                    amount
                ) ||
                amount <= 0
            ) {

                alert(
                    "Enter a valid whole stock quantity."
                );

                return;

            }


            /*
            * Determine API transaction type.
            */

            const type =
                adjustmentType === "add"
                    ? "purchase"
                    : "damaged";


            try {

                setAdjustingStock(
                    true
                );


                const {
                    data
                } = await axios.post(

                    `/api/admin/medicines/${medicine._id}/stock`,

                    {

                        type,

                        quantity:
                            amount,

                        reason:
                            adjustmentType ===
                                "add"
                                ? "Manual stock addition"
                                : "Manual stock removal",

                    }

                );


                /*
                |--------------------------------------------------------------------------
                | USE SERVER STOCK
                |--------------------------------------------------------------------------
                */

                if (
                    data?.medicine
                ) {

                    setForm(
                        (previous) => ({

                            ...previous,

                            stock:
                                data.medicine
                                    .stock,

                        })
                    );

                }


                setStockAdjustment(
                    ""
                );


                alert(
                    "Stock updated successfully."
                );


            } catch (error) {

                console.error(
                    "Stock adjustment error:",
                    error
                );


                alert(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                    "Failed to update stock."
                );


            } finally {

                setAdjustingStock(
                    false
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | DEACTIVATE / ACTIVATE
    |--------------------------------------------------------------------------
    */

    const handleStatusChange =
        async (
            nextStatus
        ) => {

            try {

                const {
                    data
                } = await axios.put(

                    `/api/admin/medicines/${medicine._id}/status`,

                    {
                        status:
                            nextStatus,
                    }

                );


                if (data) {

                    setForm(
                        (previous) => ({

                            ...previous,

                            status:
                                data.status ||
                                nextStatus,

                        })
                    );

                }


                setShowDeactivate(
                    false
                );


            } catch (error) {

                console.error(
                    "Medicine status error:",
                    error
                );


                alert(
                    error
                        ?.response
                        ?.data
                        ?.message ||
                    "Failed to update medicine status."
                );

            }

        };


    /*
    |--------------------------------------------------------------------------
    | TITLE
    |--------------------------------------------------------------------------
    */

    const stockNumber =
        Number(
            form.stock
        );


    const reorderNumber =
        Number(
            form.reorderLevel
        );


    return (
        <>

            <Head>

                <title>
                    {medicine.name}
                    {" | "}
                    Medicine Management
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
                        TOP
                    ====================================================== */}

                    <div
                        className={
                            styles.topBar
                        }
                    >

                        <Link
                            href="/admin/medicines"
                            className={
                                styles.backLink
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>


                        <span>
                            /
                        </span>


                        <strong>
                            {medicine.code}
                        </strong>

                    </div>


                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <header
                        className={
                            styles.manageHeader
                        }
                    >

                        <div>

                            <span>
                                MEDICINE MANAGEMENT
                            </span>


                            <h1>
                                {medicine.name}
                            </h1>


                            <p>
                                {
                                    form.genericName
                                }

                                {" • "}

                                {
                                    form.strength
                                }
                            </p>

                        </div>


                        <div
                            className={
                                styles.headerBadges
                            }
                        >

                            <span
                                className={`${styles.statusBadge} ${form.status ===
                                        "active"
                                        ? styles.statusActive
                                        : styles.statusInactive
                                    }`}
                            >

                                {form.status ===
                                    "active" ? (

                                    <CheckCircleOutlineRoundedIcon />

                                ) : (

                                    <BlockOutlinedIcon />

                                )}


                                {form.status ===
                                    "active"
                                    ? "Active"
                                    : "Inactive"}

                            </span>


                            {form.prescriptionRequired && (

                                <span
                                    className={
                                        styles.prescriptionBadge
                                    }
                                >

                                    <DescriptionOutlinedIcon />

                                    Prescription Required

                                </span>

                            )}

                        </div>

                    </header>


                    {/* =====================================================
                        QUICK INFO
                    ====================================================== */}

                    <section
                        className={
                            styles.medicineQuickInfo
                        }
                    >

                        <div>

                            <span>
                                Medicine Code
                            </span>

                            <strong>
                                {
                                    medicine.code
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Current Price
                            </span>

                            <strong>
                                ৳{form.price}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Current Stock
                            </span>

                            <strong>
                                {
                                    form.stock
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Reorder Level
                            </span>

                            <strong>
                                {
                                    form.reorderLevel
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Last Updated
                            </span>

                            <strong>
                                {
                                    new Date(
                                        medicine.updatedAt
                                    ).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day:
                                                "2-digit",
                                            month:
                                                "short",
                                            year:
                                                "numeric",
                                        }
                                    )
                                }
                            </strong>

                        </div>

                    </section>


                    {/* =====================================================
                        MAIN FORM
                    ====================================================== */}

                    <form
                        onSubmit={
                            handleSave
                        }
                        className={
                            styles.form
                        }
                    >

                        <div
                            className={
                                styles.manageGrid
                            }
                        >


                            {/* =================================================
                                LEFT
                            ================================================== */}

                            <div
                                className={
                                    styles.mainColumn
                                }
                            >


                                {/* =============================================
                                    BASIC
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

                                            <MedicalServicesOutlinedIcon />

                                            <div>

                                                <h2>
                                                    Basic information
                                                </h2>

                                                <span>
                                                    Medicine catalog information
                                                </span>

                                            </div>

                                        </div>


                                        <EditOutlinedIcon
                                            className={
                                                styles.headerEditIcon
                                            }
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.formGrid
                                        }
                                    >

                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Medicine name
                                            </label>

                                            <input
                                                name="name"
                                                value={
                                                    form.name
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Generic name
                                            </label>

                                            <input
                                                name="genericName"
                                                value={
                                                    form.genericName
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Strength
                                            </label>

                                            <input
                                                name="strength"
                                                value={
                                                    form.strength
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Dosage form
                                            </label>

                                            <select
                                                name="dosageForm"
                                                value={
                                                    form.dosageForm
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                {dosageForms.map(
                                                    (
                                                        item
                                                    ) => (

                                                        <option
                                                            key={
                                                                item
                                                            }
                                                            value={
                                                                item
                                                            }
                                                        >
                                                            {
                                                                item
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Pack size
                                            </label>

                                            <input
                                                name="packSize"
                                                value={
                                                    form.packSize
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Manufacturer
                                            </label>

                                            <input
                                                name="manufacturer"
                                                value={
                                                    form.manufacturer
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Category
                                            </label>

                                            <select
                                                name="category"
                                                value={
                                                    form.category
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            >

                                                {categories.map(
                                                    (
                                                        item
                                                    ) => (

                                                        <option
                                                            key={
                                                                item
                                                            }
                                                            value={
                                                                item
                                                            }
                                                        >
                                                            {
                                                                item
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>

                                </section>


                                {/* =============================================
                                    IMAGE
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

                                        <ImageOutlinedIcon />

                                        <div>

                                            <h2>
                                                Medicine image
                                            </h2>

                                            <span>
                                                Product image
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.imageUpload
                                        }
                                    >

                                        <label
                                            className={
                                                styles.uploadBox
                                            }
                                        >

                                            {imagePreview ? (

                                                <img
                                                    src={
                                                        imagePreview
                                                    }
                                                    alt={
                                                        medicine.name
                                                    }
                                                />

                                            ) : (

                                                <>

                                                    <ImageOutlinedIcon />

                                                    <strong>
                                                        Upload image
                                                    </strong>

                                                    <span>
                                                        JPG, PNG or WEBP
                                                    </span>

                                                </>

                                            )}


                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={
                                                    handleImage
                                                }
                                                hidden
                                            />

                                        </label>

                                    </div>

                                </section>


                                {/* =============================================
                                    DESCRIPTION
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

                                        <LocalPharmacyOutlinedIcon />

                                        <div>

                                            <h2>
                                                Additional information
                                            </h2>

                                            <span>
                                                Medicine details
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.textareaGrid
                                        }
                                    >

                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                value={
                                                    form.description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows={
                                                    4
                                                }
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.formGroup
                                            }
                                        >

                                            <label>
                                                Usage / directions
                                            </label>

                                            <textarea
                                                name="usage"
                                                value={
                                                    form.usage
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows={
                                                    4
                                                }
                                            />

                                        </div>


                                        <div
                                            className={`${styles.formGroup} ${styles.fullWidth}`}
                                        >

                                            <label>
                                                Warnings
                                            </label>

                                            <textarea
                                                name="warnings"
                                                value={
                                                    form.warnings
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows={
                                                    3
                                                }
                                            />

                                        </div>

                                    </div>

                                </section>

                            </div>


                            {/* =================================================
                                SIDEBAR
                            ================================================== */}

                            <aside
                                className={
                                    styles.sidebar
                                }
                            >


                                {/* =============================================
                                    PRICING
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

                                        <Inventory2OutlinedIcon />

                                        <div>

                                            <h2>
                                                Pricing
                                            </h2>

                                            <span>
                                                Selling price
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.formGroup
                                        }
                                        style={{
                                            marginTop:
                                                "15px",
                                        }}
                                    >

                                        <label>
                                            Selling price
                                        </label>


                                        <div
                                            className={
                                                styles.moneyInput
                                            }
                                        >

                                            <span>
                                                ৳
                                            </span>


                                            <input
                                                name="price"
                                                type="number"
                                                min="0"
                                                value={
                                                    form.price
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>

                                </section>


                                {/* =============================================
                                    INVENTORY
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

                                        <Inventory2OutlinedIcon />

                                        <div>

                                            <h2>
                                                Inventory
                                            </h2>

                                            <span>
                                                Manage stock
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.stockSummary
                                        }
                                    >

                                        <div>

                                            <span>
                                                Current stock
                                            </span>

                                            <strong>
                                                {
                                                    stockNumber
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Reorder level
                                            </span>

                                            <strong>
                                                {
                                                    reorderNumber
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.stockAdjustment
                                        }
                                    >

                                        <div
                                            className={
                                                styles.adjustmentToggle
                                            }
                                        >

                                            <button
                                                type="button"
                                                className={
                                                    adjustmentType ===
                                                        "add"
                                                        ? styles.adjustmentActive
                                                        : styles.adjustmentButton
                                                }
                                                onClick={() =>
                                                    setAdjustmentType(
                                                        "add"
                                                    )
                                                }
                                            >

                                                <AddRoundedIcon />

                                                Add

                                            </button>


                                            <button
                                                type="button"
                                                className={
                                                    adjustmentType ===
                                                        "remove"
                                                        ? styles.adjustmentRemoveActive
                                                        : styles.adjustmentButton
                                                }
                                                onClick={() =>
                                                    setAdjustmentType(
                                                        "remove"
                                                    )
                                                }
                                            >

                                                <RemoveRoundedIcon />

                                                Remove

                                            </button>

                                        </div>


                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                stockAdjustment
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setStockAdjustment(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Quantity"
                                        />


                                        <button
                                            type="button"
                                            className={
                                                styles.adjustStockButton
                                            }
                                            onClick={
                                                handleStockAdjustment
                                            }
                                            disabled={
                                                adjustingStock
                                            }
                                        >

                                            {
                                                adjustingStock
                                                    ? "Updating..."
                                                    : "Update Stock"
                                            }

                                        </button>

                                    </div>


                                    <div
                                        className={
                                            styles.reorderField
                                        }
                                    >

                                        <label>
                                            Reorder level
                                        </label>


                                        <input
                                            name="reorderLevel"
                                            type="number"
                                            min="0"
                                            value={
                                                form.reorderLevel
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    </div>

                                </section>


                                {/* =============================================
                                    PRESCRIPTION
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

                                        <DescriptionOutlinedIcon />

                                        <div>

                                            <h2>
                                                Prescription
                                            </h2>

                                            <span>
                                                Ordering requirement
                                            </span>

                                        </div>

                                    </div>


                                    <label
                                        className={
                                            styles.checkboxRow
                                        }
                                    >

                                        <input
                                            type="checkbox"
                                            name="prescriptionRequired"
                                            checked={
                                                form.prescriptionRequired
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />


                                        <div>

                                            <strong>
                                                Prescription required
                                            </strong>

                                            <span>
                                                Patient must provide a
                                                prescription.
                                            </span>

                                        </div>

                                    </label>

                                </section>


                                {/* =============================================
                                    STATUS
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

                                        <CheckCircleOutlineRoundedIcon />

                                        <div>

                                            <h2>
                                                Catalog status
                                            </h2>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.statusOptions
                                        }
                                    >

                                        <label
                                            className={
                                                form.status ===
                                                    "active"
                                                    ? styles.statusOptionActive
                                                    : styles.statusOption
                                            }
                                        >

                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={
                                                    form.status ===
                                                    "active"
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <div>

                                                <strong>
                                                    Active
                                                </strong>

                                                <span>
                                                    Available for customers
                                                </span>

                                            </div>

                                        </label>


                                        <label
                                            className={
                                                form.status ===
                                                    "inactive"
                                                    ? styles.statusOptionInactive
                                                    : styles.statusOption
                                            }
                                        >

                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={
                                                    form.status ===
                                                    "inactive"
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <div>

                                                <strong>
                                                    Inactive
                                                </strong>

                                                <span>
                                                    Hidden from catalog
                                                </span>

                                            </div>

                                        </label>

                                    </div>

                                </section>


                                {/* =============================================
                                    HISTORY
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

                                        <HistoryOutlinedIcon />

                                        <div>

                                            <h2>
                                                Medicine history
                                            </h2>

                                            <span>
                                                Catalog record
                                            </span>

                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.history
                                        }
                                    >

                                        <div>

                                            <span>
                                                Created
                                            </span>

                                            <strong>
                                                {
                                                    new Date(
                                                        medicine.createdAt
                                                    ).toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                            day:
                                                                "2-digit",
                                                            month:
                                                                "short",
                                                            year:
                                                                "numeric",
                                                        }
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Last updated
                                            </span>

                                            <strong>
                                                {
                                                    new Date(
                                                        medicine.updatedAt
                                                    ).toLocaleDateString(
                                                        "en-GB",
                                                        {
                                                            day:
                                                                "2-digit",
                                                            month:
                                                                "short",
                                                            year:
                                                                "numeric",
                                                        }
                                                    )
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>


                                {/* =============================================
                                    SAVE
                                ============================================== */}

                                <button
                                    type="submit"
                                    className={
                                        styles.saveButton
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    <SaveOutlinedIcon />

                                    {
                                        saving
                                            ? "Saving..."
                                            : "Save Changes"
                                    }

                                </button>


                                {/* =============================================
                                    STATUS ACTION
                                ============================================== */}

                                {form.status ===
                                    "active" ? (

                                    <button
                                        type="button"
                                        className={
                                            styles.deactivateButton
                                        }
                                        onClick={() =>
                                            setShowDeactivate(
                                                true
                                            )
                                        }
                                    >

                                        <BlockOutlinedIcon />

                                        Deactivate Medicine

                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        className={
                                            styles.activateButton
                                        }
                                        onClick={() =>
                                            handleStatusChange(
                                                "active"
                                            )
                                        }
                                    >

                                        <CheckCircleOutlineRoundedIcon />

                                        Activate Medicine

                                    </button>

                                )}

                            </aside>

                        </div>

                    </form>

                </div>

            </main>


            {/* =====================================================
                DEACTIVATE MODAL
            ====================================================== */}

            {showDeactivate && (

                <div
                    className={
                        styles.modalOverlay
                    }
                    onClick={() =>
                        setShowDeactivate(
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
                                setShowDeactivate(
                                    false
                                )
                            }
                        >

                            <CloseRoundedIcon />

                        </button>


                        <div
                            className={
                                styles.modalIcon
                            }
                        >

                            <BlockOutlinedIcon />

                        </div>


                        <h2>
                            Deactivate medicine?
                        </h2>


                        <p>
                            This medicine will no longer appear
                            as available for customers to order.
                        </p>


                        <div
                            className={
                                styles.modalActions
                            }
                        >

                            <button
                                type="button"
                                className={
                                    styles.cancelButton
                                }
                                onClick={() =>
                                    setShowDeactivate(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className={
                                    styles.dangerButton
                                }
                                onClick={() =>
                                    handleStatusChange(
                                        "inactive"
                                    )
                                }
                            >
                                Deactivate
                            </button>

                        </div>

                    </div>

                </div>

            )}



        </>
    );
}


/*
|--------------------------------------------------------------------------
| SERVER SIDE DATA
|--------------------------------------------------------------------------
*/

export async function getServerSideProps(
    context
) {

    const {
        req,
        params
    } = context;


    const cookies =
        req.headers.cookie || "";


    try {

        /*
        |--------------------------------------------------------------------------
        | BASE URL
        |--------------------------------------------------------------------------
        */

        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            process.env.BASE_URL ||
            `http://localhost:${process.env.PORT ||
            3000
            }`;


        /*
        |--------------------------------------------------------------------------
        | FETCH MEDICINE
        |--------------------------------------------------------------------------
        */

        const {
            data
        } = await axios.get(

            `${baseUrl}/api/admin/medicines/${params.id}`,

            {

                headers: {

                    Cookie:
                        cookies,

                },

            }

        );


        return {

            props: {

                medicine:
                    data,

            },

        };


    } catch (error) {

        console.error(
            "Medicine SSR error:",
            error?.response?.data ||
            error.message
        );


        return {

            props: {

                medicine:
                    null,

            },

        };

    }

}