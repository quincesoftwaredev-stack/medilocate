import Link from "next/link";

import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import styles from "./MedicineHero.module.css";

export default function MedicineHero({
    search,
    onSearchChange,
    onClearSearch,
}) {
    return (
        <section className={styles.hero}>

            <div className={styles.container}>

                <div className={styles.heroContent}>

                    <div className={styles.heroText}>

                        <span className={styles.eyebrow}>
                            MEDICINE DELIVERY
                        </span>

                        <h1>
                            Get your medicines
                            <span>
                                delivered fast.
                            </span>
                        </h1>

                        <p>
                            Search for medicines,
                            add them to your cart
                            or simply upload your
                            prescription.
                        </p>

                    </div>


                    {/* SEARCH */}

                    <div className={styles.searchBox}>

                        <SearchIcon />

                        <input
                            type="text"
                            value={search}
                            onChange={onSearchChange}
                            placeholder="Search medicine, generic name or brand..."
                            aria-label="Search medicines"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={onClearSearch}
                                className={styles.clearSearch}
                                aria-label="Clear search"
                            >
                                <CloseRoundedIcon />
                            </button>
                        )}

                    </div>


                    {/* DELIVERY FEATURES */}

                    <div className={styles.heroFeatures}>

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


                {/* PRESCRIPTION */}

                <div className={styles.prescriptionCard}>

                    <div className={styles.prescriptionIcon}>

                        <CloudUploadOutlinedIcon />

                    </div>


                    <div className={styles.prescriptionContent}>

                        <span className={styles.prescriptionLabel}>
                            HAVE A PRESCRIPTION?
                        </span>

                        <h2>
                            Upload it.
                            <br />
                            We'll handle the rest.
                        </h2>

                        <p>
                            Don't want to search for
                            each medicine? Upload your
                            complete prescription and
                            we'll help prepare your order.
                        </p>


                        <Link
                            href="/prescription"
                            className={styles.uploadButton}
                        >

                            <CloudUploadOutlinedIcon />

                            <span>
                                Upload Prescription
                            </span>

                            <ArrowForwardRoundedIcon />

                        </Link>

                    </div>

                </div>

            </div>

        </section>
    );
}
