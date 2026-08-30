import Link from "next/link";

import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import styles from "./MedicineHero.module.css";


export default function MedicineHero({
    search,
    onSearchChange,
    onClearSearch,
}) {

    return (

        <section
            className={
                `${styles.hero} ${
                    search
                        ? styles.searching
                        : ""
                }`
            }
        >

            <div
                className={
                    styles.container
                }
            >


                {/* =====================================================
                    SEARCH AREA
                ====================================================== */}

                <div
                    className={
                        styles.heroContent
                    }
                >

                    <div
                        className={
                            styles.heroText
                        }
                    >

                        <span
                            className={
                                styles.eyebrow
                            }
                        >
                            MEDICINE DELIVERY
                        </span>


                        <h1>
                            Search & order
                            {" "}
                            <span>
                                medicines
                            </span>
                        </h1>


                        <p>
                            Find your medicine or upload
                            a prescription for quick ordering.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div
                        className={
                            styles.searchBox
                        }
                    >

                        <SearchIcon />


                        <input
                            type="text"
                            value={search}
                            onChange={
                                onSearchChange
                            }
                            placeholder="Search medicine, generic name or brand..."
                            aria-label="Search medicines"
                        />


                        {search && (

                            <button
                                type="button"
                                onClick={
                                    onClearSearch
                                }
                                className={
                                    styles.clearSearch
                                }
                                aria-label="Clear search"
                            >

                                <CloseRoundedIcon />

                            </button>

                        )}

                    </div>

                </div>


                {/* =====================================================
                    PRESCRIPTION CTA
                ====================================================== */}

                <div
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

                        <span
                            className={
                                styles.prescriptionLabel
                            }
                        >
                            HAVE A PRESCRIPTION?
                        </span>


                        <h2>
                            Upload Prescription
                        </h2>


                        <p>
                            Upload it and we'll help
                            prepare your order.
                        </p>


                        <Link
                            href="/prescription"
                            className={
                                styles.uploadButton
                            }
                        >

                            <span>
                                Upload Now
                            </span>

                            <ArrowForwardRoundedIcon />

                        </Link>

                    </div>

                </div>

            </div>

        </section>

    );

}
