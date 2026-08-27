import Link from "next/link";

import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";

import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.hero}>

            <div className={styles.container}>

                <div className={styles.heroGrid}>

                    {/* =====================================================
                        HERO CONTENT
                    ====================================================== */}

                    <div className={styles.heroContent}>

                        <div className={styles.heroBadge}>
                            <span />
                            Healthcare made closer
                        </div>


                        <h1>
                            Your healthcare,
                            <span> closer to you.</span>
                        </h1>


                        <p className={styles.heroDescription}>
                            Find trusted doctors near you and get
                            medicines delivered conveniently to your
                            doorstep.
                        </p>


                        {/* ACTION BUTTONS */}

                        <div className={styles.heroActions}>

                            <Link
                                href="/doctors"
                                className={styles.primaryButton}
                            >
                                <MedicalServicesOutlinedIcon />

                                <span>
                                    Find a Doctor
                                </span>

                                <ArrowForwardIcon />
                            </Link>


                            <Link
                                href="/medicines"
                                className={styles.secondaryButton}
                            >
                                <LocalPharmacyOutlinedIcon />

                                <span>
                                    Order Medicine
                                </span>
                            </Link>

                        </div>


                        {/* SEARCH */}

                        <div className={styles.heroSearch}>

                            <SearchIcon />

                            <input
                                type="text"
                                placeholder="Search doctors, specialties or medicines..."
                            />

                            <button type="button">
                                Search
                            </button>

                        </div>


                        {/* STATS */}

                        <div className={styles.heroStats}>

                            <div>
                                <strong>
                                    500+
                                </strong>

                                <span>
                                    Doctors
                                </span>
                            </div>


                            <div className={styles.statDivider} />


                            <div>
                                <strong>
                                    1,000+
                                </strong>

                                <span>
                                    Medicines
                                </span>
                            </div>


                            <div className={styles.statDivider} />


                            <div>
                                <strong>
                                    24/7
                                </strong>

                                <span>
                                    Access
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        HERO VISUAL
                    ====================================================== */}

                    <div className={styles.heroVisual}>

                        <div className={styles.heroBackgroundCircle} />


                        {/* CENTER */}

                        <div className={styles.heroCenterIcon}>
                            <HealthAndSafetyOutlinedIcon />
                        </div>


                        {/* DOCTOR CARD */}

                        <div className={styles.heroMedicalCard}>

                            <div className={styles.medicalCardHeader}>

                                <span>
                                    Healthcare
                                </span>

                                <VerifiedOutlinedIcon />

                            </div>


                            <div className={styles.medicalCardBody}>

                                <div className={styles.doctorAvatar}>
                                    <MedicalServicesOutlinedIcon />
                                </div>


                                <div>

                                    <strong>
                                        Find a Doctor
                                    </strong>

                                    <span>
                                        Near your location
                                    </span>

                                </div>

                            </div>


                            <div className={styles.cardLocation}>

                                <LocationOnOutlinedIcon />

                                Doctors near you

                            </div>

                        </div>


                        {/* MEDICINE CARD */}

                        <div className={styles.heroMedicineCard}>

                            <div className={styles.medicineIcon}>
                                <LocalPharmacyOutlinedIcon />
                            </div>


                            <div>

                                <strong>
                                    Medicine Delivery
                                </strong>

                                <span>
                                    To your doorstep
                                </span>

                            </div>


                            <div className={styles.deliveryCheck}>
                                <VerifiedOutlinedIcon />
                            </div>

                        </div>


                        {/* FLOATING BADGE */}

                        <div className={styles.heroFloatingBadge}>

                            <VerifiedOutlinedIcon />

                            Convenient healthcare

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}