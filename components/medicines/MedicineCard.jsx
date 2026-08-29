import Link from "next/link";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

import styles from "./MedicineCard.module.css";


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


    return (

        <article
            className={
                styles.card
            }
        >


            {/* =====================================================
                IMAGE
            ====================================================== */}

            <Link
                href={
                    `/medicines/${medicine._id}`
                }
                className={
                    styles.image
                }
            >

                {medicine.image?.url ? (

                    <img
                        src={
                            medicine.image.url
                        }
                        alt={
                            medicine.name ||
                            "Medicine"
                        }
                    />

                ) : (

                    <div
                        className={
                            styles.placeholder
                        }
                    >

                        <strong>
                            {
                                medicine.name ||
                                "Medicine"
                            }
                        </strong>

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

                    Prescription required

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


                {/* MEDICINE NAME */}

                <Link
                    href={
                        `/medicines/${medicine._id}`
                    }
                    className={
                        styles.name
                    }
                >

                    {
                        medicine.name
                    }

                </Link>


                {/* GENERIC NAME */}

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
                    DETAILS
                ================================================== */}

                <div
                    className={
                        styles.details
                    }
                >

                    {medicine.strength && (

                        <span>
                            {medicine.strength}
                        </span>

                    )}


                    {medicine.dosageForm && (

                        <span>
                            {medicine.dosageForm}
                        </span>

                    )}


                    {medicine.packSize && (

                        <span>
                            {medicine.packSize}
                        </span>

                    )}

                </div>


                {/* MANUFACTURER */}

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


                {/* =================================================
                    FOOTER
                ================================================== */}

                <div
                    className={
                        styles.footer
                    }
                >


                    {/* PRICE */}

                    <strong
                        className={
                            styles.price
                        }
                    >

                        ৳
                        {Number(
                            medicine.price || 0
                        ).toFixed(2)}

                    </strong>


                    {/* =================================================
                        ADD TO CART
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


                        /* =================================================
                           QUANTITY
                        ================================================== */

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
                                {quantity}
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
