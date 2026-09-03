import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ArrowBackRoundedIcon
    from "@mui/icons-material/ArrowBackRounded";

import ArrowForwardRoundedIcon
    from "@mui/icons-material/ArrowForwardRounded";

import AddRoundedIcon
    from "@mui/icons-material/AddRounded";

import RemoveRoundedIcon
    from "@mui/icons-material/RemoveRounded";

import ShoppingCartOutlinedIcon
    from "@mui/icons-material/ShoppingCartOutlined";

import CloudUploadOutlinedIcon
    from "@mui/icons-material/CloudUploadOutlined";

import LocalShippingOutlinedIcon
    from "@mui/icons-material/LocalShippingOutlined";

import VerifiedOutlinedIcon
    from "@mui/icons-material/VerifiedOutlined";

import DescriptionOutlinedIcon
    from "@mui/icons-material/DescriptionOutlined";

import InfoOutlinedIcon
    from "@mui/icons-material/InfoOutlined";

import MedicationRoundedIcon
    from "@mui/icons-material/MedicationRounded";

import LocalDrinkRoundedIcon
    from "@mui/icons-material/LocalDrinkRounded";

import VaccinesRoundedIcon
    from "@mui/icons-material/VaccinesRounded";

import OpacityRoundedIcon
    from "@mui/icons-material/OpacityRounded";

import AirRoundedIcon
    from "@mui/icons-material/AirRounded";

import SpaRoundedIcon
    from "@mui/icons-material/SpaRounded";

import ScienceRoundedIcon
    from "@mui/icons-material/ScienceRounded";

import styles
    from "@/styles/Medicines/MedicineDetails.module.css";

import { useDispatch } from "react-redux";

import {
    addToCart as addToCartAction,
} from "@/redux/cartSlice";


/* =========================================================
   DOSAGE FORM META
========================================================= */

const getDosageFormMeta = (dosageForm = "") => {

    const value = String(
        dosageForm || ""
    )
        .trim()
        .toLowerCase();


    /* LIQUID */

    if (
        value.includes("syrup") ||
        value.includes("suspension") ||
        value.includes("solution") ||
        value.includes("liquid") ||
        value.includes("elixir")
    ) {
        return {
            type: "liquid",
            icon: <LocalDrinkRoundedIcon />,
        };
    }


    /* SUPPOSITORY */

    if (
        value.includes("suppository")
    ) {
        return {
            type: "suppository",
            icon: <SpaRoundedIcon />,
        };
    }


    /* CAPSULE */

    if (
        value.includes("capsule")
    ) {
        return {
            type: "capsule",
            icon: <MedicationRoundedIcon />,
        };
    }


    /* TABLET */

    if (
        value.includes("tablet") ||
        value.includes("caplet")
    ) {
        return {
            type: "tablet",
            icon: <MedicationRoundedIcon />,
        };
    }


    /* INJECTION */

    if (
        value.includes("injection") ||
        value.includes("injectable")
    ) {
        return {
            type: "injection",
            icon: <VaccinesRoundedIcon />,
        };
    }


    /* DROPS */

    if (
        value.includes("drop")
    ) {
        return {
            type: "drops",
            icon: <OpacityRoundedIcon />,
        };
    }


    /* INHALER */

    if (
        value.includes("inhaler") ||
        value.includes("inhalation") ||
        value.includes("respirator")
    ) {
        return {
            type: "inhaler",
            icon: <AirRoundedIcon />,
        };
    }


    /* TOPICAL */

    if (
        value.includes("cream") ||
        value.includes("ointment") ||
        value.includes("gel") ||
        value.includes("lotion")
    ) {
        return {
            type: "topical",
            icon: <SpaRoundedIcon />,
        };
    }


    /* POWDER */

    if (
        value.includes("powder") ||
        value.includes("granule")
    ) {
        return {
            type: "powder",
            icon: <ScienceRoundedIcon />,
        };
    }


    return {
        type: "other",
        icon: <MedicationRoundedIcon />,
    };
};


/* =========================================================
   MEDICINE DETAILS PAGE
========================================================= */

export default function MedicineDetailsPage({
    medicine: initialMedicine,
}) {

    const dispatch =
        useDispatch();

    const router =
        useRouter();


    const [
        medicine,
        setMedicine,
    ] = useState(
        initialMedicine || null
    );


    const [
        loadingMedicine,
        setLoadingMedicine,
    ] = useState(
        !initialMedicine
    );


    /* =====================================================
       FALLBACK MEDICINE LOAD
    ===================================================== */

    useEffect(() => {

        if (
            !router.isReady ||
            initialMedicine
        ) {
            return;
        }


        fetch(
            "/data/medicines-catalog.json"
        )
            .then(
                response =>
                    response.ok
                        ? response.json()
                        : []
            )
            .then(catalog => {

                const item =
                    Array.isArray(catalog)
                        ? catalog.find(
                            entry =>
                                String(
                                    entry._id
                                ) ===
                                String(
                                    router.query.id
                                )
                        )
                        : null;


                setMedicine(
                    item
                        ? {
                            ...item,

                            image: {
                                url:
                                    item.image || "",
                            },
                        }
                        : null
                );

            })
            .catch(
                () =>
                    setMedicine(null)
            )
            .finally(
                () =>
                    setLoadingMedicine(false)
            );

    }, [
        router.isReady,
        router.query.id,
        initialMedicine,
    ]);


    /* =====================================================
       QUANTITY
    ===================================================== */

    const [
        quantity,
        setQuantity,
    ] = useState(1);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loadingMedicine) {

        return (

            <main
                className={
                    styles.notFound
                }
            >

                <p>
                    Loading medicine...
                </p>

            </main>

        );

    }


    /* =====================================================
       NOT FOUND
    ===================================================== */

    if (!medicine) {

        return (
            <>

                <Head>

                    <title>
                        Medicine Not Found | MediLocate
                    </title>

                </Head>


                <main
                    className={
                        styles.notFound
                    }
                >

                    <InfoOutlinedIcon />


                    <h1>
                        Medicine not found
                    </h1>


                    <p>
                        The medicine you're looking for
                        could not be found.
                    </p>


                    <Link
                        href="/medicines"
                    >
                        Browse Medicines
                    </Link>

                </main>

            </>
        );

    }


    /* =====================================================
       DOSAGE FORM
    ===================================================== */

    const dosageMeta =
        getDosageFormMeta(
            medicine.dosageForm
        );


    /* =====================================================
       QUANTITY
    ===================================================== */

    const increaseQuantity = () => {

        setQuantity(
            previous =>
                previous + 1
        );

    };


    const decreaseQuantity = () => {

        setQuantity(
            previous =>
                Math.max(
                    1,
                    previous - 1
                )
        );

    };


    /* =====================================================
       CART
    ===================================================== */

    const addToCart = () => {

        dispatch(

            addToCartAction({

                id:
                    medicine._id,

                name:
                    medicine.name,

                genericName:
                    medicine.genericName,

                strength:
                    medicine.strength,

                dosageForm:
                    medicine.dosageForm,

                manufacturer:
                    medicine.manufacturer,

                price:
                    medicine.price,

                packSize:
                    medicine.packSize,

                image:
                    medicine.image?.url || "",

                prescriptionRequired:
                    medicine.prescriptionRequired,

            })

        );


        router.push(
            "/cart"
        );

    };


    /* =====================================================
       TOTAL PRICE
    ===================================================== */

    const totalPrice =
        Number(
            medicine.price || 0
        ) *
        quantity;


    /* =====================================================
       IMAGE
    ===================================================== */

    const medicineImage =
        medicine.image?.url || "";


    /* =====================================================
       USES
    ===================================================== */

    const uses =
        Array.isArray(
            medicine.usage
        )
            ? medicine.usage
            : medicine.usage
                ? [
                    medicine.usage,
                ]
                : [];


    /* =====================================================
       PACK SIZE
    ===================================================== */

    const packSize =
        medicine.packSize ||
        "Available pack";


    /* =====================================================
       STOCK
    ===================================================== */

    const inStock =
        Number(
            medicine.stock || 0
        ) > 0;


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <>

            <Head>

                <title>

                    {medicine.name}

                    {" "}

                    {medicine.strength}

                    {" | MediLocate"}

                </title>


                <meta
                    name="description"
                    content={
                        `${medicine.name} ${medicine.strength || ""} ${medicine.dosageForm || ""} - ${medicine.genericName}. Order medicine online with MediLocate.`
                    }
                />

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


                    {/* =================================================
                        BREADCRUMB
                    ================================================== */}

                    <div
                        className={
                            styles.breadcrumb
                        }
                    >

                        <Link
                            href="/medicines"
                        >

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>


                        <span>
                            /
                        </span>


                        <span>
                            {
                                medicine.name
                            }
                        </span>

                    </div>


                    {/* =================================================
                        MAIN PRODUCT
                    ================================================== */}

                    <section
                        className={
                            styles.productSection
                        }
                    >


                        {/* =================================================
                            VISUAL
                        ================================================== */}

                        <div
                            className={
                                styles.productVisual
                            }
                        >

                            <div
                                className={
                                    `${styles.imageBox}
                                    ${styles[`imageBox_${dosageMeta.type}`]}`
                                }
                            >

                                {/* {medicineImage ? (

                                    <img
                                        src={
                                            medicineImage
                                        }
                                        alt={
                                            medicine.name
                                        }
                                    />

                                ) : ( */}

                                    <div
                                        className={
                                            `${styles.imagePlaceholder}
                                            ${styles[`placeholder_${dosageMeta.type}`]}`
                                        }
                                    >

                                        <div
                                            className={
                                                styles.placeholderIcon
                                            }
                                        >

                                            {
                                                dosageMeta.icon
                                            }

                                        </div>


                                        <strong>
                                            {
                                                medicine.dosageForm ||
                                                "Medicine"
                                            }
                                        </strong>

                                    </div>

                                {/* )} */}


                                {/* DOSAGE IDENTITY */}

                                {medicine.dosageForm && (

                                    <div
                                        className={
                                            `${styles.visualDosage}
                                            ${styles[`dosage_${dosageMeta.type}`]}`
                                        }
                                    >

                                        {
                                            dosageMeta.icon
                                        }

                                        <span>
                                            {
                                                medicine.dosageForm
                                            }
                                        </span>

                                    </div>

                                )}

                            </div>


                            {medicine.category && (

                                <span
                                    className={
                                        styles.categoryTag
                                    }
                                >

                                    {
                                        medicine.category
                                    }

                                </span>

                            )}

                        </div>


                        {/* =================================================
                            PRODUCT INFORMATION
                        ================================================== */}

                        <div
                            className={
                                styles.productInfo
                            }
                        >


                            {/* =================================================
                                HEADER
                            ================================================== */}

                            <div
                                className={
                                    styles.productHeader
                                }
                            >

                                <div
                                    className={
                                        styles.titleArea
                                    }
                                >

                                    {medicine.genericName && (

                                        <span
                                            className={
                                                styles.genericName
                                            }
                                        >

                                            {
                                                medicine.genericName
                                            }

                                        </span>

                                    )}


                                    <h1>
                                        {
                                            medicine.name
                                        }
                                    </h1>


                                    {/* VARIANT */}

                                    <div
                                        className={
                                            styles.variantRow
                                        }
                                    >

                                        {medicine.dosageForm && (

                                            <span
                                                className={
                                                    `${styles.dosageBadge}
                                                    ${styles[`dosage_${dosageMeta.type}`]}`
                                                }
                                            >

                                                {
                                                    dosageMeta.icon
                                                }

                                                <strong>
                                                    {
                                                        medicine.dosageForm
                                                    }
                                                </strong>

                                            </span>

                                        )}


                                        {medicine.strength && (

                                            <strong
                                                className={
                                                    styles.strengthBadge
                                                }
                                            >

                                                {
                                                    medicine.strength
                                                }

                                            </strong>

                                        )}

                                    </div>

                                </div>


                                {inStock ? (

                                    <span
                                        className={
                                            styles.inStock
                                        }
                                    >

                                        In stock

                                    </span>

                                ) : (

                                    <span
                                        className={
                                            styles.outOfStock
                                        }
                                    >

                                        Out of stock

                                    </span>

                                )}

                            </div>


                            {/* =================================================
                                QUICK INFO
                            ================================================== */}

                            <div
                                className={
                                    styles.quickInfo
                                }
                            >

                                <div>

                                    <span>
                                        Pack
                                    </span>

                                    <strong>
                                        {
                                            packSize
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Manufacturer
                                    </span>

                                    <strong>
                                        {
                                            medicine.manufacturer ||
                                            "Not specified"
                                        }
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                PRICE
                            ================================================== */}

                            <div
                                className={
                                    styles.priceSection
                                }
                            >

                                <div>

                                    <span
                                        className={
                                            styles.priceLabel
                                        }
                                    >
                                        Price
                                    </span>


                                    <div
                                        className={
                                            styles.price
                                        }
                                    >

                                        <span>
                                            ৳
                                        </span>

                                        <strong>

                                            {
                                                Number(
                                                    medicine.price || 0
                                                ).toFixed(2)
                                            }

                                        </strong>

                                    </div>

                                </div>


                                <span
                                    className={
                                        styles.pricePack
                                    }
                                >

                                    per {packSize}

                                </span>

                            </div>


                            {/* =================================================
                                PRESCRIPTION NOTICE
                            ================================================== */}

                            {medicine.prescriptionRequired && (

                                <div
                                    className={
                                        styles.prescriptionNotice
                                    }
                                >

                                    <div>

                                        <DescriptionOutlinedIcon />

                                    </div>


                                    <section>

                                        <strong>
                                            Prescription required
                                        </strong>

                                        <p>
                                            A valid prescription may
                                            be required before this
                                            medicine can be delivered.
                                        </p>

                                    </section>

                                </div>

                            )}


                            {/* =================================================
                                DESCRIPTION
                            ================================================== */}

                            {medicine.description && (

                                <div
                                    className={
                                        styles.description
                                    }
                                >

                                    <h2>
                                        About this medicine
                                    </h2>

                                    <p>
                                        {
                                            medicine.description
                                        }
                                    </p>

                                </div>

                            )}


                            {/* =================================================
                                QUANTITY + CART
                            ================================================== */}

                            <div
                                className={
                                    styles.orderArea
                                }
                            >

                                <div
                                    className={
                                        styles.quantity
                                    }
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            quantity <= 1
                                        }
                                        aria-label="Decrease quantity"
                                    >

                                        <RemoveRoundedIcon />

                                    </button>


                                    <strong>
                                        {
                                            quantity
                                        }
                                    </strong>


                                    <button
                                        type="button"
                                        onClick={
                                            increaseQuantity
                                        }
                                        aria-label="Increase quantity"
                                    >

                                        <AddRoundedIcon />

                                    </button>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        addToCart
                                    }
                                    disabled={
                                        !inStock
                                    }
                                    className={
                                        styles.addToCart
                                    }
                                >

                                    <ShoppingCartOutlinedIcon />

                                    <span
                                        className={
                                            styles.cartText
                                        }
                                    >
                                        Add to Cart
                                    </span>


                                    <strong>
                                        ৳
                                        {
                                            totalPrice.toFixed(2)
                                        }
                                    </strong>

                                </button>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        SERVICES
                    ================================================== */}

                    <section
                        className={
                            styles.serviceGrid
                        }
                    >

                        <div
                            className={
                                styles.serviceCard
                            }
                        >

                            <div
                                className={
                                    styles.serviceIcon
                                }
                            >

                                <LocalShippingOutlinedIcon />

                            </div>


                            <div>

                                <strong>
                                    Fast local delivery
                                </strong>

                                <p>
                                    Get your medicines delivered
                                    quickly within our service area.
                                </p>

                            </div>

                        </div>


                        <div
                            className={
                                styles.serviceCard
                            }
                        >

                            <div
                                className={
                                    styles.serviceIcon
                                }
                            >

                                <VerifiedOutlinedIcon />

                            </div>


                            <div>

                                <strong>
                                    Genuine medicines
                                </strong>

                                <p>
                                    Medicines are sourced through
                                    verified pharmacy partners.
                                </p>

                            </div>

                        </div>


                        <div
                            className={
                                styles.serviceCard
                            }
                        >

                            <div
                                className={
                                    styles.serviceIcon
                                }
                            >

                                <CloudUploadOutlinedIcon />

                            </div>


                            <div>

                                <strong>
                                    Have a prescription?
                                </strong>

                                <p>
                                    Upload your prescription and
                                    we'll help prepare your order.
                                </p>


                                <Link
                                    href="/prescription"
                                >

                                    Upload prescription

                                    <ArrowForwardRoundedIcon />

                                </Link>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        DETAILS
                    ================================================== */}

                    <section
                        className={
                            styles.detailsSection
                        }
                    >

                        <div
                            className={
                                styles.detailsHeader
                            }
                        >

                            <span>
                                MEDICINE INFORMATION
                            </span>

                            <h2>
                                Product details
                            </h2>

                        </div>


                        <div
                            className={
                                styles.detailsGrid
                            }
                        >

                            <div>

                                <span>
                                    Generic name
                                </span>

                                <strong>
                                    {
                                        medicine.genericName ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Strength
                                </span>

                                <strong>
                                    {
                                        medicine.strength ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Dosage form
                                </span>

                                <strong
                                    className={
                                        styles.detailDosage
                                    }
                                >

                                    {
                                        dosageMeta.icon
                                    }

                                    {
                                        medicine.dosageForm ||
                                        "—"
                                    }

                                </strong>

                            </div>


                            <div>

                                <span>
                                    Pack size
                                </span>

                                <strong>
                                    {
                                        packSize
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Manufacturer
                                </span>

                                <strong>
                                    {
                                        medicine.manufacturer ||
                                        "—"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {
                                        medicine.category ||
                                        "Other"
                                    }
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        USES
                    ================================================== */}

                    {uses.length > 0 && (

                        <section
                            className={
                                styles.usesSection
                            }
                        >

                            <div>

                                <span>
                                    COMMON USES
                                </span>

                                <h2>
                                    What is it used for?
                                </h2>

                            </div>


                            <div
                                className={
                                    styles.usesList
                                }
                            >

                                {uses.map(
                                    (
                                        use,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                index
                                            }
                                            className={
                                                styles.useItem
                                            }
                                        >

                                            <VerifiedOutlinedIcon />

                                            <span>
                                                {
                                                    use
                                                }
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </section>

                    )}


                    {/* =================================================
                        WARNINGS
                    ================================================== */}

                    {medicine.warnings && (

                        <section
                            className={
                                styles.description
                            }
                        >

                            <h2>
                                Warnings
                            </h2>

                            <p>
                                {
                                    medicine.warnings
                                }
                            </p>

                        </section>

                    )}


                    {/* =================================================
                        DISCLAIMER
                    ================================================== */}

                    <div
                        className={
                            styles.disclaimer
                        }
                    >

                        <InfoOutlinedIcon />

                        <p>
                            Medicine information is provided for
                            general reference only. Always follow
                            the instructions of your doctor or
                            pharmacist and check the medicine
                            packaging before use.
                        </p>

                    </div>

                </div>

            </main>

        </>
    );
}