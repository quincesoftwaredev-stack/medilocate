import Link from "next/link";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import styles from "./PrescriptionSection.module.css";

const steps = [
    {
        number: "01",
        title: "Upload",
        description: "Take a photo or upload your prescription.",
        icon: CloudUploadOutlinedIcon,
    },
    {
        number: "02",
        title: "Review",
        description: "A pharmacy reviews the medicines on your prescription.",
        icon: LocalPharmacyOutlinedIcon,
    },
    {
        number: "03",
        title: "Prepare",
        description: "Your medicines are collected and prepared for delivery.",
        icon: DescriptionOutlinedIcon,
    },
    {
        number: "04",
        title: "Deliver",
        description: "Receive your medicines at your doorstep.",
        icon: LocalShippingOutlinedIcon,
    },
];

export default function PrescriptionSection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>

                <div className={styles.grid}>

                    {/* =================================================
                        LEFT CONTENT
                    ================================================== */}

                    <div className={styles.content}>

                        <span className={styles.label}>
                            PRESCRIPTION ORDERING
                        </span>


                        <h2>
                            Have a prescription?
                            <span> We've got you.</span>
                        </h2>


                        <p className={styles.description}>
                            You don't need to search for every medicine
                            individually. Simply upload your complete
                            prescription and let Medilocate help you
                            get the medicines you need.
                        </p>


                        {/* Benefits */}

                        <div className={styles.benefits}>

                            <div className={styles.benefit}>

                                <div className={styles.benefitIcon}>
                                    <CheckCircleOutlineIcon />
                                </div>

                                <div>
                                    <strong>
                                        Easy ordering
                                    </strong>

                                    <span>
                                        Upload your prescription in seconds.
                                    </span>
                                </div>

                            </div>


                            <div className={styles.benefit}>

                                <div className={styles.benefitIcon}>
                                    <CheckCircleOutlineIcon />
                                </div>

                                <div>
                                    <strong>
                                        Pharmacy verified
                                    </strong>

                                    <span>
                                        Your prescription is reviewed before processing.
                                    </span>
                                </div>

                            </div>


                            <div className={styles.benefit}>

                                <div className={styles.benefitIcon}>
                                    <CheckCircleOutlineIcon />
                                </div>

                                <div>
                                    <strong>
                                        Convenient delivery
                                    </strong>

                                    <span>
                                        Get your medicines delivered to your doorstep.
                                    </span>
                                </div>

                            </div>

                        </div>


                        {/* CTA */}

                        <div className={styles.actions}>

                            <Link
                                href="/prescription"
                                className={styles.primaryButton}
                            >
                                <CloudUploadOutlinedIcon />

                                Upload Prescription

                                <ArrowForwardIcon />
                            </Link>

                        </div>


                        {/* Security */}

                        <div className={styles.security}>

                            <SecurityOutlinedIcon />

                            <span>
                                Your prescription information is handled securely.
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        RIGHT VISUAL
                    ================================================== */}

                    <div className={styles.visual}>

                        {/* Background */}

                        <div className={styles.visualCircle} />


                        {/* Prescription Document */}

                        <div className={styles.prescriptionDocument}>

                            <div className={styles.documentHeader}>

                                <div className={styles.documentLogo}>
                                    M
                                </div>

                                <div>

                                    <strong>
                                        Prescription
                                    </strong>

                                    <span>
                                        Medilocate
                                    </span>

                                </div>

                            </div>


                            <div className={styles.doctorLine}>

                                <span>
                                    Dr. Healthcare
                                </span>

                                <span>
                                    Date: 26 Aug 2026
                                </span>

                            </div>


                            <div className={styles.documentLines}>

                                <span />
                                <span />
                                <span />
                                <span />
                                <span />

                            </div>


                            <div className={styles.medicineRows}>

                                <div>
                                    <span />
                                    <span />
                                </div>

                                <div>
                                    <span />
                                    <span />
                                </div>

                                <div>
                                    <span />
                                    <span />
                                </div>

                            </div>


                            <div className={styles.signature}>
                                <span />
                            </div>

                        </div>


                        {/* Upload Badge */}

                        <div className={styles.uploadBadge}>

                            <div>
                                <CloudUploadOutlinedIcon />
                            </div>

                            <span>
                                Prescription uploaded
                            </span>

                            <CheckCircleOutlineIcon />

                        </div>


                        {/* Delivery Badge */}

                        <div className={styles.deliveryBadge}>

                            <div className={styles.deliveryBadgeIcon}>
                                <LocalShippingOutlinedIcon />
                            </div>

                            <div>
                                <strong>
                                    Ready for delivery
                                </strong>

                                <span>
                                    Nearby pharmacy
                                </span>
                            </div>

                        </div>


                        {/* Floating security badge */}

                        <div className={styles.secureBadge}>

                            <SecurityOutlinedIcon />

                            Secure

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    PROCESS
                ====================================================== */}

                <div className={styles.process}>

                    <div className={styles.processHeader}>

                        <span>
                            SIMPLE PROCESS
                        </span>

                        <h3>
                            From prescription to doorstep.
                        </h3>

                    </div>


                    <div className={styles.processGrid}>

                        {steps.map((step, index) => {

                            const Icon = step.icon;

                            return (
                                <div
                                    className={styles.processStep}
                                    key={step.number}
                                >

                                    <div className={styles.processIcon}>
                                        <Icon />
                                    </div>


                                    <div className={styles.processNumber}>
                                        {step.number}
                                    </div>


                                    <div className={styles.processContent}>

                                        <h4>
                                            {step.title}
                                        </h4>

                                        <p>
                                            {step.description}
                                        </p>

                                    </div>


                                    {index < steps.length - 1 && (
                                        <div className={styles.processArrow}>
                                            <ArrowForwardIcon />
                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>

                </div>

            </div>
        </section>
    );
}