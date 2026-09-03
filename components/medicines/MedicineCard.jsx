import Link from "next/link";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

import MedicationRoundedIcon from "@mui/icons-material/MedicationRounded";
import LocalDrinkRoundedIcon from "@mui/icons-material/LocalDrinkRounded";
import VaccinesRoundedIcon from "@mui/icons-material/VaccinesRounded";
import OpacityRoundedIcon from "@mui/icons-material/OpacityRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";

import styles from "./MedicineCard.module.css";


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


export default function MedicineCard({
    medicine,
    quantity = 0,
    onAdd,
    onIncrease,
    onDecrease,
}) {

    if (!medicine) {
        return null;
    }


    const dosageMeta =
        getDosageFormMeta(
            medicine.dosageForm
        );


    const medicineUrl =
        `/medicines/${medicine._id}`;


    return (

        <article
            className={
                styles.card
            }
        >


            {/* =====================================================
                IMAGE SECTION
            ====================================================== */}

            <Link
                href={
                    medicineUrl
                }
                className={
                    styles.imageSection
                }
            >



                <div
                    className={
                        `${styles.placeholder}
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

                    <span>
                        {
                            medicine.dosageForm ||
                            "Medicine"
                        }
                    </span>

                </div>




                {/* DOSAGE FORM STRIP */}

                {medicine.dosageForm && (

                    <div
                        className={
                            `${styles.dosageStrip}
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

            </Link>


            {/* =====================================================
                PRESCRIPTION BADGE
            ====================================================== */}

            {medicine.prescriptionRequired && (

                <span
                    className={
                        styles.prescriptionBadge
                    }
                >

                    Rx

                </span>

            )}


            {/* =====================================================
                INFORMATION
            ====================================================== */}

            <div
                className={
                    styles.info
                }
            >


                {/* =================================================
                    MAIN INFO
                ================================================== */}

                <div
                    className={
                        styles.mainInfo
                    }
                >


                    {/* NAME */}

                    <Link
                        href={
                            medicineUrl
                        }
                        className={
                            styles.name
                        }
                    >

                        {
                            medicine.name
                        }

                    </Link>


                    {/* =================================================
                        MOBILE VARIANT LINE
                    ================================================== */}

                    <div
                        className={
                            styles.mobileVariant
                        }
                    >

                        {medicine.dosageForm && (

                            <span
                                className={
                                    `${styles.mobileDosage}
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
                                    styles.mobileStrength
                                }
                            >

                                {
                                    medicine.strength
                                }

                            </strong>

                        )}

                    </div>


                    {/* =================================================
                        DESKTOP STRENGTH
                    ================================================== */}

                    {medicine.strength && (

                        <div
                            className={
                                styles.strength
                            }
                        >

                            {
                                medicine.strength
                            }

                        </div>

                    )}


                    {/* =================================================
                        GENERIC
                    ================================================== */}

                    {medicine.genericName && (

                        <span
                            className={
                                styles.generic
                            }
                        >

                            {
                                medicine.genericName
                            }

                        </span>

                    )}


                    {/* =================================================
                        PACK
                    ================================================== */}

                    {medicine.packSize && (

                        <div
                            className={
                                styles.pack
                            }
                        >

                            {/* <span>
                                Pack
                            </span> */}

                            <strong>
                                {
                                    medicine.packSize
                                }
                            </strong>

                        </div>

                    )}


                    {/* =================================================
                        MANUFACTURER
                    ================================================== */}

                    {medicine.manufacturer && (

                        <span
                            className={
                                styles.manufacturer
                            }
                        >

                            {
                                medicine.manufacturer
                            }

                        </span>

                    )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================== */}

                <div
                    className={
                        styles.footer
                    }
                >


                    {/* PRICE */}

                    <div
                        className={
                            styles.priceWrapper
                        }
                    >

                        <span
                            className={
                                styles.currency
                            }
                        >
                            ৳
                        </span>

                        <strong
                            className={
                                styles.price
                            }
                        >

                            {Number(
                                medicine.price || 0
                            ).toFixed(2)}

                        </strong>

                    </div>


                    {/* =================================================
                        CART
                    ================================================== */}

                    {quantity === 0 ? (

                        <button
                            type="button"
                            className={
                                styles.addButton
                            }
                            onClick={() =>
                                onAdd(
                                    medicine
                                )
                            }
                        >

                            <AddRoundedIcon />

                            <span>
                                Add
                            </span>

                        </button>

                    ) : (

                        <div
                            className={
                                styles.quantity
                            }
                        >

                            <button
                                type="button"
                                onClick={() =>
                                    onDecrease(
                                        medicine
                                    )
                                }
                                aria-label={
                                    `Decrease quantity of ${medicine.name}`
                                }
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
                                onClick={() =>
                                    onIncrease(
                                        medicine
                                    )
                                }
                                aria-label={
                                    `Increase quantity of ${medicine.name}`
                                }
                            >

                                <AddRoundedIcon />

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </article>

    );
}