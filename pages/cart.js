import Head from "next/head";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import LocalDrinkRoundedIcon from "@mui/icons-material/LocalDrinkRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";


import {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
} from "@/redux/cartSlice";

import styles from "@/styles/Cart/Cart.module.css";



const getDosageFormMeta = (dosageForm = "") => {

    const value = String(dosageForm || "")
        .trim()
        .toLowerCase();


    /* =====================================================
       LIQUID / ORAL LIQUID
    ===================================================== */

    if (
        value.includes("syrup") ||
        value.includes("suspension") ||
        value.includes("solution") ||
        value.includes("liquid") ||
        value.includes("elixir") ||
        value.includes("mixture") ||
        value.includes("emulsion") ||
        value.includes("mouthwash") ||
        value.includes("gargle")
    ) {
        return {
            type: "liquid",
            icon: <LocalDrinkRoundedIcon />,
        };
    }


    /* =====================================================
       CAPSULE
    ===================================================== */

    if (
        value.includes("capsule") ||
        value.includes("softgel") ||
        value.includes("soft gel")
    ) {
        return {
            type: "capsule",
            icon: <MedicationRoundedIcon />,
        };
    }


    /* =====================================================
       TABLET
       Handles:
       Tablet
       Chewable Tablet
       Dispersible Tablet
       Sustained Release Tablet
       Extended Release Tablet
       Film Coated Tablet
       Effervescent Tablet
       etc.
    ===================================================== */

    if (
        value.includes("tablet") ||
        value.includes("caplet") ||
        value.includes("pill") ||
        value.includes("lozenge")
    ) {
        return {
            type: "tablet",
            icon: <MedicationRoundedIcon />,
        };
    }


    /* =====================================================
       INJECTION / IV
    ===================================================== */

    if (
        value.includes("injection") ||
        value.includes("injectable") ||
        value.includes("infusion") ||
        value.includes("iv infusion") ||
        value.includes("i.v.") ||
        value.includes("ampoule") ||
        value.includes("ampule") ||
        value.includes("vial") ||
        value.includes("prefilled syringe") ||
        value.includes("pre-filled syringe")
    ) {
        return {
            type: "injection",
            icon: <VaccinesRoundedIcon />,
        };
    }


    /* =====================================================
       DROPS
       Eye / Ear / Nasal drops
    ===================================================== */

    if (
        value.includes("drop") ||
        value.includes("eye drop") ||
        value.includes("ear drop") ||
        value.includes("nasal drop") ||
        value.includes("ophthalmic drop") ||
        value.includes("otic drop")
    ) {
        return {
            type: "drops",
            icon: <OpacityRoundedIcon />,
        };
    }


    /* =====================================================
       INHALER / RESPIRATORY
    ===================================================== */

    if (
        value.includes("inhaler") ||
        value.includes("inhalation") ||
        value.includes("respirator") ||
        value.includes("nebulizer") ||
        value.includes("nebuliser") ||
        value.includes("nebule") ||
        value.includes("rotacap") ||
        value.includes("rotahaler") ||
        value.includes("dpi") ||
        value.includes("metered dose") ||
        value.includes("mdi")
    ) {
        return {
            type: "inhaler",
            icon: <AirRoundedIcon />,
        };
    }


    /* =====================================================
       SPRAY
       Nasal spray / oral spray / throat spray
    ===================================================== */

    if (
        value.includes("spray") ||
        value.includes("nasal spray") ||
        value.includes("oral spray") ||
        value.includes("throat spray")
    ) {
        return {
            type: "inhaler",
            icon: <AirRoundedIcon />,
        };
    }


    /* =====================================================
       TOPICAL
    ===================================================== */

    if (
        value.includes("cream") ||
        value.includes("ointment") ||
        value.includes("gel") ||
        value.includes("lotion") ||
        value.includes("paste") ||
        value.includes("balm") ||
        value.includes("liniment") ||
        value.includes("paint") ||
        value.includes("topical") ||
        value.includes("jelly")
    ) {
        return {
            type: "topical",
            icon: <SpaRoundedIcon />,
        };
    }


    /* =====================================================
       SUPPOSITORY / RECTAL / VAGINAL
    ===================================================== */

    if (
        value.includes("suppository") ||
        value.includes("pessary") ||
        value.includes("vaginal tablet") ||
        value.includes("rectal")
    ) {
        return {
            type: "suppository",
            icon: <SpaRoundedIcon />,
        };
    }


    /* =====================================================
       POWDER / GRANULE / SACHET
    ===================================================== */

    if (
        value.includes("powder") ||
        value.includes("granule") ||
        value.includes("granules") ||
        value.includes("sachet") ||
        value.includes("dry powder") ||
        value.includes("oral powder")
    ) {
        return {
            type: "powder",
            icon: <ScienceRoundedIcon />,
        };
    }


    /* =====================================================
       ORS / POWDER FOR SOLUTION
    ===================================================== */

    if (
        value.includes("powder for solution") ||
        value.includes("powder for suspension") ||
        value.includes("dry syrup")
    ) {
        return {
            type: "powder",
            icon: <ScienceRoundedIcon />,
        };
    }


    /* =====================================================
       PATCH
    ===================================================== */

    if (
        value.includes("patch") ||
        value.includes("transdermal")
    ) {
        return {
            type: "topical",
            icon: <SpaRoundedIcon />,
        };
    }


    /* =====================================================
       SHAMPOO / WASH
    ===================================================== */

    if (
        value.includes("shampoo") ||
        value.includes("wash") ||
        value.includes("cleanser")
    ) {
        return {
            type: "topical",
            icon: <SpaRoundedIcon />,
        };
    }


    /* =====================================================
       DENTAL
    ===================================================== */

    if (
        value.includes("toothpaste") ||
        value.includes("dental gel") ||
        value.includes("dental paste")
    ) {
        return {
            type: "topical",
            icon: <SpaRoundedIcon />,
        };
    }


    /* =====================================================
       UNKNOWN / FALLBACK

       This guarantees that even an unusual dosage form
       still receives an icon.
    ===================================================== */

    return {
        type: "other",
        icon: <MedicationRoundedIcon />,
    };

};

export default function CartPage() {

    const dispatch = useDispatch();


    const items =
        useSelector(
            (state) =>
                state.cart?.items || []
        );


    const prescription =
        useSelector(
            (state) =>
                state.cart?.prescription
        );


    /*
    |--------------------------------------------------------------------------
    | CALCULATIONS
    |--------------------------------------------------------------------------
    */

    const totalItems =
        items.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    const subtotal =
        items.reduce(
            (total, item) =>
                total +
                item.price *
                item.quantity,
            0
        );


    /*
     * Delivery charge will eventually
     * come from your backend based on:
     *
     * - patient location
     * - delivery radius
     * - pharmacy
     * - order value
     *
     */

    const deliveryCharge =
        subtotal > 500
            ? 0
            : 50;


    const total =
        subtotal +
        deliveryCharge;


    /*
    |--------------------------------------------------------------------------
    | EMPTY CART
    |--------------------------------------------------------------------------
    */

    if (items.length === 0) {

        return (
            <>
                <Head>

                    <title>
                        Your Cart | MediLocate
                    </title>

                </Head>




                <main className={styles.page}>

                    <div className={styles.container}>

                        <div className={styles.emptyCart}>

                            <div
                                className={
                                    styles.emptyIcon
                                }
                            >

                                <ShoppingCartOutlinedIcon />

                            </div>


                            <h1>
                                Your cart is empty
                            </h1>


                            <p>
                                Add medicines to your cart
                                and they'll appear here.
                            </p>


                            <Link
                                href="/medicines"
                                className={
                                    styles.browseButton
                                }
                            >

                                Browse Medicines

                                <ArrowForwardRoundedIcon />

                            </Link>

                        </div>

                    </div>

                </main>


            </>
        );

    }


    return (
        <>
            <Head>

                <title>
                    Your Cart | MediLocate
                </title>

                <meta
                    name="description"
                    content="Review your medicines, upload a prescription and continue to checkout with MediLocate."
                />

            </Head>




            <main className={styles.page}>

                <div className={styles.container}>


                    {/* =================================================
                        BREADCRUMB
                    ================================================== */}

                    <div className={styles.breadcrumb}>

                        <Link href="/medicines">

                            <ArrowBackRoundedIcon />

                            Medicines

                        </Link>

                        <span>
                            /
                        </span>

                        <strong>
                            Cart
                        </strong>

                    </div>


                    {/* =================================================
                        HEADER
                    ================================================== */}

                    <header className={styles.header}>

                        <div>

                            <span>
                                YOUR ORDER
                            </span>

                            <p>
                                {totalItems}{" "}
                                {totalItems === 1
                                    ? "item"
                                    : "items"}{" "}
                                ready for checkout.
                            </p>

                        </div>


                        <Link
                            href="/medicines"
                            className={
                                styles.continueShopping
                            }
                        >

                            <ArrowBackRoundedIcon />

                            Continue shopping

                        </Link>

                    </header>


                    {/* =================================================
                        MAIN GRID
                    ================================================== */}

                    <div className={styles.cartLayout}>


                        {/* =================================================
                            LEFT
                        ================================================== */}

                        <div className={styles.cartMain}>


                            {/* =============================================
                                ITEMS
                            ============================================== */}

                            <section
                                className={
                                    styles.itemsCard
                                }
                            >

                                <div
                                    className={
                                        styles.cardHeader
                                    }
                                >

                                    <div>

                                        <h2>
                                            Medicines
                                        </h2>

                                        <span>
                                            {totalItems}{" "}
                                            items
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.items
                                    }
                                >

                                    {items.map(
                                        (item) => {

                                            const dosageMeta =
                                                getDosageFormMeta(
                                                    item.dosageForm
                                                );

                                            const dosageType =
                                                dosageMeta.type;


                                            const handleDecrease = () => {

                                                if (
                                                    Number(
                                                        item.quantity || 0
                                                    ) <= 1
                                                ) {

                                                    // dispatch(
                                                    //     removeFromCart(
                                                    //         item.id
                                                    //     )
                                                    // );

                                                    return;
                                                }


                                                dispatch(
                                                    decreaseQuantity(
                                                        item.id
                                                    )
                                                );

                                            };


                                            return (

                                                <article
                                                    key={
                                                        item.id
                                                    }
                                                    className={
                                                        styles.cartItem
                                                    }
                                                >


                                                    {/* =================================================
                                                        IMAGE / DOSAGE IDENTITY
                                                    ================================================== */}

                                                    <Link
                                                        href={`/medicines/${item.id}`}
                                                        className={
                                                            `${styles.itemImage} ${styles[
                                                            `itemImage_${dosageType}`
                                                            ]
                                                            }`
                                                        }
                                                    >

                                                        {/* {item.image ? (

                                                            <img
                                                                src={
                                                                    item.image
                                                                }
                                                                alt={
                                                                    item.name
                                                                }
                                                            />

                                                        ) : ( */}

                                                        <span
                                                            className={
                                                                styles.itemPlaceholder
                                                            }
                                                        >

                                                            <span
                                                                className={
                                                                    styles.itemPlaceholderIcon
                                                                }
                                                            >
                                                                {
                                                                    dosageMeta.icon
                                                                }
                                                            </span>

                                                            <small>
                                                                {
                                                                    item.dosageForm ||
                                                                    "Medicine"
                                                                }
                                                            </small>

                                                        </span>

                                                        {/* )} */}

                                                    </Link>


                                                    {/* =================================================
                                                        INFO
                                                    ================================================== */}

                                                    <div
                                                        className={
                                                            styles.itemInfo
                                                        }
                                                    >

                                                        <Link
                                                            href={`/medicines/${item.id}`}
                                                            className={
                                                                styles.itemName
                                                            }
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </Link>


                                                        <div
                                                            className={
                                                                styles.itemVariant
                                                            }
                                                        >

                                                            {item.dosageForm && (

                                                                <span
                                                                    className={
                                                                        `${styles.itemDosageBadge} ${styles[
                                                                        `itemDosage_${dosageType}`
                                                                        ]
                                                                        }`
                                                                    }
                                                                >

                                                                    <span
                                                                        className={
                                                                            styles.itemDosageIcon
                                                                        }
                                                                    >
                                                                        {
                                                                            dosageMeta.icon
                                                                        }
                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            item.dosageForm
                                                                        }
                                                                    </span>

                                                                </span>

                                                            )}


                                                            {item.strength && (

                                                                <strong
                                                                    className={
                                                                        styles.itemStrength
                                                                    }
                                                                >
                                                                    {
                                                                        item.strength
                                                                    }
                                                                </strong>

                                                            )}


                                                        </div>

                                                        {item.packSize && (

                                                            <span
                                                                className={
                                                                    styles.itemGeneric
                                                                }
                                                            >
                                                                {
                                                                    item.packSize
                                                                }
                                                            </span>

                                                        )}
                                                        {item.genericName && (

                                                            <span
                                                                className={
                                                                    styles.itemGeneric
                                                                }
                                                            >
                                                                {
                                                                    item.genericName
                                                                }
                                                            </span>

                                                        )}




                                                        {item.prescriptionRequired && (

                                                            <span
                                                                className={
                                                                    styles.rxBadge
                                                                }
                                                            >
                                                                Prescription required
                                                            </span>

                                                        )}

                                                    </div>


                                                    {/* =================================================
                                                        QUANTITY
                                                    ================================================== */}

                                                    <div
                                                        className={
                                                            styles.quantity
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={
                                                                handleDecrease
                                                            }
                                                            aria-label={`Decrease quantity of ${item.name}`}
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
                                                                dispatch(
                                                                    increaseQuantity(
                                                                        item.id
                                                                    )
                                                                )
                                                            }
                                                            aria-label={`Increase quantity of ${item.name}`}
                                                        >

                                                            <AddRoundedIcon />

                                                        </button>

                                                    </div>


                                                    {/* =================================================
                                                        PRICE
                                                    ================================================== */}

                                                    <div
                                                        className={
                                                            styles.itemPrice
                                                        }
                                                    >

                                                        <strong>
                                                            ৳
                                                            {
                                                                (
                                                                    item.price *
                                                                    item.quantity
                                                                ).toFixed(2)
                                                            }
                                                        </strong>


                                                        <span>
                                                            ৳
                                                            {
                                                                Number(
                                                                    item.price || 0
                                                                ).toFixed(2)
                                                            }
                                                            {" "}
                                                            each
                                                        </span>

                                                    </div>


                                                    {/* =================================================
                                                        DELETE
                                                    ================================================== */}

                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.deleteButton
                                                        }
                                                        onClick={() =>
                                                            dispatch(
                                                                removeFromCart(
                                                                    item.id
                                                                )
                                                            )
                                                        }
                                                        aria-label={`Remove ${item.name}`}
                                                    >

                                                        <DeleteOutlineRoundedIcon />

                                                    </button>

                                                </article>

                                            );

                                        }
                                    )}

                                </div>

                            </section>


                            {/* =================================================
                                PRESCRIPTION
                            ================================================== */}

                            <section
                                className={
                                    styles.prescriptionCard
                                }
                            >

                                <div
                                    className={
                                        styles.prescriptionIcon
                                    }
                                >

                                    <CloudUploadOutlinedIcon />

                                </div>


                                <div
                                    className={
                                        styles.prescriptionContent
                                    }
                                >

                                    <div>

                                        <span>
                                            PRESCRIPTION
                                        </span>

                                        <h2>
                                            Do you have a prescription?
                                        </h2>

                                        <p>
                                            Upload your complete
                                            prescription and we'll
                                            help match it with your
                                            medicine order.
                                        </p>

                                    </div>


                                    {prescription ? (

                                        <Link
                                            href="/prescription"
                                            className={
                                                styles.uploadedPrescription
                                            }
                                        >

                                            <VerifiedOutlinedIcon />

                                            Prescription uploaded

                                            <ArrowForwardRoundedIcon />

                                        </Link>

                                    ) : (

                                        <Link
                                            href="/prescription"
                                            className={
                                                styles.uploadPrescription
                                            }
                                        >

                                            <CloudUploadOutlinedIcon />

                                            Upload prescription

                                            <ArrowForwardRoundedIcon />

                                        </Link>

                                    )}

                                </div>

                            </section>


                            {/* =================================================
                                DELIVERY INFO
                            ================================================== */}

                            <div
                                className={
                                    styles.deliveryInfo
                                }
                            >

                                <div>

                                    <LocalShippingOutlinedIcon />

                                    <span>
                                        Fast local delivery
                                    </span>

                                </div>


                                <div>

                                    <VerifiedOutlinedIcon />

                                    <span>
                                        Genuine medicines
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ORDER SUMMARY
                        ================================================== */}

                        <aside
                            className={
                                styles.summaryCard
                            }
                        >

                            <h2>
                                Order summary
                            </h2>


                            <div
                                className={
                                    styles.summaryRows
                                }
                            >

                                <div>

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        ৳{subtotal}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Delivery
                                    </span>

                                    <strong>

                                        {deliveryCharge === 0
                                            ? "FREE"
                                            : `৳${deliveryCharge}`}

                                    </strong>

                                </div>

                            </div>


                            {deliveryCharge > 0 && (

                                <div
                                    className={
                                        styles.freeDeliveryHint
                                    }
                                >

                                    Add ৳
                                    {500 - subtotal}
                                    {" "}
                                    more to get free
                                    delivery.

                                </div>

                            )}


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


                            <Link
                                href="/checkout"
                                className={
                                    styles.checkoutButton
                                }
                            >

                                Proceed to Checkout

                                <ArrowForwardRoundedIcon />

                            </Link>


                            <div
                                className={
                                    styles.secureNote
                                }
                            >

                                <VerifiedOutlinedIcon />

                                <span>
                                    Secure checkout
                                </span>

                            </div>

                        </aside>

                    </div>

                </div>

            </main>



        </>
    );
}
