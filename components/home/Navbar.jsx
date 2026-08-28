import Link from "next/link";
import { useEffect, useState } from "react";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import Logo from "@/components/Utility/Logo";

import styles from "./Navbar.module.css";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    return (
        <>
            <header className={styles.navbar}>

                <div className={styles.container}>

                    <div className={styles.navbarInner}>

                        {/* Logo */}

                        <Link
                            href="/"
                            className={styles.logo}
                            onClick={closeMenu}
                            aria-label="MediLocate home"
                        >
                            <Logo />
                        </Link>


                        {/* Desktop / Tablet Navigation */}

                        <nav className={styles.navLinks}>

                            <Link
                                href="/doctors"
                                className={styles.doctorLink}
                            >
                                <MedicalServicesOutlinedIcon />
                                <span>Find a Doctor</span>
                            </Link>


                            <Link
                                href="/medicines"
                                className={styles.medicineLink}
                            >
                                <LocalPharmacyOutlinedIcon />
                                <span>Medicines</span>
                            </Link>


                            <Link
                                href="/prescription"
                                className={styles.prescriptionLink}
                            >
                                <ReceiptLongOutlinedIcon />
                                <span>Prescription</span>
                            </Link>


                            <Link
                                href="/track-order"
                                className={styles.trackLink}
                            >
                                <LocalShippingOutlinedIcon />
                                <span>Track Order</span>
                            </Link>


                            <Link
                                href="/how-it-works"
                                className={styles.howItWorksLink}
                            >
                                <span>How It Works</span>
                            </Link>

                        </nav>


                        {/* Desktop Actions */}

                        <div className={styles.navActions}>

                            <Link
                                href="/login"
                                className={styles.loginButton}
                            >
                                Login
                            </Link>


                            <Link
                                href="/register"
                                className={styles.ctaButton}
                            >
                                <span>
                                    Get Started
                                </span>

                                <ArrowForwardRoundedIcon />
                            </Link>

                        </div>


                        {/* Menu Button */}

                        <button
                            type="button"
                            className={styles.menuButton}
                            onClick={() => setMenuOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={menuOpen}
                        >
                            <MenuIcon />
                        </button>

                    </div>

                </div>

            </header>


            {/* =========================================================
                MENU OVERLAY
            ========================================================== */}

            <div
                className={`${styles.menuOverlay} ${
                    menuOpen
                        ? styles.menuOverlayOpen
                        : ""
                }`}
                onClick={closeMenu}
            >

                <aside
                    className={`${styles.menuPanel} ${
                        menuOpen
                            ? styles.menuPanelOpen
                            : ""
                    }`}
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >

                    <div className={styles.menuHeader}>

                        <span>
                            Menu
                        </span>

                        <button
                            type="button"
                            onClick={closeMenu}
                            aria-label="Close navigation menu"
                        >
                            <CloseIcon />
                        </button>

                    </div>


                    <nav className={styles.mobileLinks}>

                        <Link
                            href="/doctors"
                            onClick={closeMenu}
                        >
                            <MedicalServicesOutlinedIcon />

                            <span>
                                Find a Doctor
                            </span>
                        </Link>


                        <Link
                            href="/medicines"
                            onClick={closeMenu}
                        >
                            <LocalPharmacyOutlinedIcon />

                            <span>
                                Medicines
                            </span>
                        </Link>


                        <Link
                            href="/medicines/prescription"
                            onClick={closeMenu}
                        >
                            <ReceiptLongOutlinedIcon />

                            <span>
                                Upload Prescription
                            </span>
                        </Link>


                        <Link
                            href="/track-order"
                            onClick={closeMenu}
                        >
                            <LocalShippingOutlinedIcon />

                            <span>
                                Track Order
                            </span>
                        </Link>


                        <Link
                            href="/how-it-works"
                            onClick={closeMenu}
                        >
                            <HelpOutlineOutlinedIcon />

                            <span>
                                How It Works
                            </span>
                        </Link>

                    </nav>


                    <div className={styles.menuBottom}>

                        <Link
                            href="/login"
                            className={styles.menuLogin}
                            onClick={closeMenu}
                        >
                            <LoginOutlinedIcon />

                            <span>
                                Login
                            </span>
                        </Link>


                        <Link
                            href="/register"
                            className={styles.menuCta}
                            onClick={closeMenu}
                        >
                            Get Started
                        </Link>

                    </div>

                </aside>

            </div>
        </>
    );
}