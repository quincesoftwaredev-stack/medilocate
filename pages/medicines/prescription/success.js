import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import styles from "@/styles/Medicines/PrescriptionSuccess.module.css";


export default function PrescriptionSuccessPage() {

    const router = useRouter();

    /*
    |--------------------------------------------------------------------------
    | TEMPORARY REQUEST DATA
    |--------------------------------------------------------------------------
    | Later this will come from the API response / URL:
    |
    | /medicines/prescription/success?id=ML-P-10284
    |
    */

    const requestId =
        router.query.request || "ML-P-10284";


    return (
        <>
            <Head>

                <title>
                    Prescription Submitted | MediLocate
                </title>

                <meta
                    name="description"
                    content="Your prescription request has been submitted successfully."
                />

            </Head>


            <Navbar />


            <main className={styles.page}>

                <div className={styles.container}>

                    {/* =====================================================
                        SUCCESS
                    ====================================================== */}

                    <section className={styles.successCard}>

                        <div className={styles.successIcon}>

                            <CheckCircleRoundedIcon />

                        </div>


                        <span className={styles.label}>
                            PRESCRIPTION SUBMITTED
                        </span>


                        <h1>
                            Your prescription has been
                            <span> received.</span>
                        </h1>


                        <p className={styles.description}>
                            We've received your prescription.
                            Our pharmacy team will review it and
                            contact you regarding your medicine order.
                        </p>


                        {/* =================================================
                            REQUEST ID
                        ================================================== */}

                        <div className={styles.requestId}>

                            <span>
                                Request ID
                            </span>

                            <strong>
                                {requestId}
                            </strong>

                        </div>


                        {/* =================================================
                            STATUS
                        ================================================== */}

                        <div className={styles.statusCard}>

                            <div className={styles.statusHeader}>

                                <div>

                                    <span>
                                        REQUEST STATUS
                                    </span>

                                    <h2>
                                        Prescription received
                                    </h2>

                                </div>


                                <span
                                    className={
                                        styles.pendingBadge
                                    }
                                >
                                    Under review
                                </span>

                            </div>


                            <div className={styles.timeline}>

                                {/* STEP 1 */}

                                <div
                                    className={`${styles.timelineItem} ${styles.completed}`}
                                >

                                    <div
                                        className={
                                            styles.timelineIcon
                                        }
                                    >

                                        <CheckCircleRoundedIcon />

                                    </div>


                                    <div
                                        className={
                                            styles.timelineContent
                                        }
                                    >

                                        <strong>
                                            Prescription received
                                        </strong>

                                        <span>
                                            Your prescription has
                                            been successfully submitted.
                                        </span>

                                    </div>

                                </div>


                                {/* STEP 2 */}

                                <div
                                    className={`${styles.timelineItem} ${styles.current}`}
                                >

                                    <div
                                        className={
                                            styles.timelineIcon
                                        }
                                    >

                                        <DescriptionOutlinedIcon />

                                    </div>


                                    <div
                                        className={
                                            styles.timelineContent
                                        }
                                    >

                                        <strong>
                                            Under review
                                        </strong>

                                        <span>
                                            Our pharmacy team will
                                            review your prescription.
                                        </span>

                                    </div>

                                </div>


                                {/* STEP 3 */}

                                <div
                                    className={styles.timelineItem}
                                >

                                    <div
                                        className={
                                            styles.timelineIcon
                                        }
                                    >

                                        <LocalPharmacyOutlinedIcon />

                                    </div>


                                    <div
                                        className={
                                            styles.timelineContent
                                        }
                                    >

                                        <strong>
                                            Order preparation
                                        </strong>

                                        <span>
                                            We'll prepare the medicines
                                            after reviewing your request.
                                        </span>

                                    </div>

                                </div>


                                {/* STEP 4 */}

                                <div
                                    className={styles.timelineItem}
                                >

                                    <div
                                        className={
                                            styles.timelineIcon
                                        }
                                    >

                                        <LocalShippingOutlinedIcon />

                                    </div>


                                    <div
                                        className={
                                            styles.timelineContent
                                        }
                                    >

                                        <strong>
                                            Delivery
                                        </strong>

                                        <span>
                                            Your medicines will be
                                            delivered to your address.
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            IMPORTANT NOTE
                        ================================================== */}

                        <div className={styles.note}>

                            <DescriptionOutlinedIcon />

                            <p>
                                <strong>
                                    No payment is required yet.
                                </strong>

                                {" "}
                                Our team will review your prescription
                                and contact you before the medicine order
                                is finalized.
                            </p>

                        </div>


                        {/* =================================================
                            ACTIONS
                        ================================================== */}

                        <div className={styles.actions}>

                            <Link
                                href="/"
                                className={styles.primaryButton}
                            >

                                <HomeOutlinedIcon />

                                Back to Home

                            </Link>


                            <Link
                                href="/medicines"
                                className={styles.secondaryButton}
                            >

                                Browse Medicines

                                <ArrowForwardRoundedIcon />

                            </Link>

                        </div>


                        {/* =================================================
                            TRACK REQUEST
                        ================================================== */}

                        <Link
                            href={`/medicines/prescription/${requestId}`}
                            className={styles.trackLink}
                        >

                            Track prescription request

                            <ArrowForwardRoundedIcon />

                        </Link>

                    </section>


                    {/* =====================================================
                        BOTTOM HELP
                    ====================================================== */}

                    <div className={styles.help}>

                        <SearchOutlinedIcon />

                        <span>
                            You can find your request later from
                            your MediLocate account.
                        </span>

                    </div>

                </div>

            </main>


            <Footer />

        </>
    );
}