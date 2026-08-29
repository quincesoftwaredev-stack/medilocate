import Link from "next/link";

import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import styles from "./Footer.module.css";

const doctorLinks = [
    {
        label: "Find Doctors",
        href: "/doctors",
    },
    {
        label: "Doctor Profiles",
        href: "/doctors",
    },
    {
        label: "Medical Specialties",
        href: "/doctors",
    },
];

const medicineLinks = [
    {
        label: "Browse Medicines",
        href: "/medicines",
    },
    {
        label: "Upload Prescription",
        href: "/prescription",
    },
    {
        label: "Medicine Cart",
        href: "/cart",
    },
];

const supportLinks = [
    {
        label: "How It Works",
        href: "/how-it-works",
    },
    {
        label: "Contact Us",
        href: "/contact",
    },
    {
        label: "Help Center",
        href: "/help",
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>

            <div className={styles.container}>

                {/* =====================================================
                    MAIN FOOTER
                ====================================================== */}

                <div className={styles.main}>

                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <div className={styles.brand}>

                        <Link
                            href="/"
                            className={styles.logo}
                        >
                            <span className={styles.logoMark}>
                                M
                            </span>

                            <span>
                                Medi<span>locate</span>
                            </span>
                        </Link>


                        <p>
                            Making healthcare easier to find,
                            access and manage.
                        </p>


                        {/* Contact */}

                        <div className={styles.contact}>

                            <div>
                                <LocationOnOutlinedIcon />

                                <span>
                                    Rangpur, Bangladesh
                                </span>
                            </div>


                            <div>
                                <PhoneOutlinedIcon />

                                <span>
                                    +880 1XXX-XXXXXX
                                </span>
                            </div>


                            <div>
                                <EmailOutlinedIcon />

                                <span>
                                    support@medilocate.com
                                </span>
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        DOCTORS
                    ================================================== */}

                    <div className={styles.column}>

                        <h3>
                            Doctors
                        </h3>

                        {doctorLinks.map((link) => (

                            <Link
                                key={link.label}
                                href={link.href}
                            >
                                {link.label}

                                <ArrowForwardIcon />
                            </Link>

                        ))}

                    </div>


                    {/* =================================================
                        MEDICINES
                    ================================================== */}

                    <div className={styles.column}>

                        <h3>
                            Medicines
                        </h3>

                        {medicineLinks.map((link) => (

                            <Link
                                key={link.label}
                                href={link.href}
                            >
                                {link.label}

                                <ArrowForwardIcon />
                            </Link>

                        ))}

                    </div>


                    {/* =================================================
                        SUPPORT
                    ================================================== */}

                    <div className={styles.column}>

                        <h3>
                            Support
                        </h3>

                        {supportLinks.map((link) => (

                            <Link
                                key={link.label}
                                href={link.href}
                            >
                                {link.label}

                                <ArrowForwardIcon />
                            </Link>

                        ))}

                    </div>

                </div>


                {/* =====================================================
                    BOTTOM
                ====================================================== */}

                <div className={styles.bottom}>

                    <span>
                        © {currentYear} Medilocate. All rights reserved.
                    </span>


                    <div className={styles.legal}>

                        <Link href="/privacy-policy">
                            Privacy Policy
                        </Link>

                        <Link href="/terms">
                            Terms & Conditions
                        </Link>

                    </div>

                </div>

            </div>

        </footer>
    );
}
