import Link from "next/link";

import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";

import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                <div className={styles.card}>

                    {/* Decorative shapes */}

                    <div className={styles.circleOne} />
                    <div className={styles.circleTwo} />


                    {/* =================================================
                        CONTENT
                    ================================================== */}

                    <div className={styles.content}>

                        <div className={styles.icon}>
                            <FavoriteBorderOutlinedIcon />
                        </div>


                        <span className={styles.label}>
                            YOUR HEALTH, SIMPLIFIED
                        </span>


                        <h2>
                            Healthcare is closer
                            <span> than you think.</span>
                        </h2>


                        <p>
                            Find a doctor for an onsite visit or order your
                            medicines from the comfort of your home.
                        </p>


                        {/* =================================================
                            ACTIONS
                        ================================================== */}

                        <div className={styles.actions}>

                            <Link
                                href="/doctors"
                                className={styles.primaryButton}
                            >
                                <SearchOutlinedIcon />

                                Find a Doctor

                                <ArrowForwardIcon />
                            </Link>


                            <Link
                                href="/medicines"
                                className={styles.secondaryButton}
                            >
                                <LocalPharmacyOutlinedIcon />

                                Order Medicine

                                <ArrowForwardIcon />
                            </Link>

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}