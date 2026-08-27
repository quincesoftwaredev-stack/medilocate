import Link from "next/link";

import MenuIcon from "@mui/icons-material/Menu";

import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <header className={styles.navbar}>
            <div className={styles.container}>

                <div className={styles.navbarInner}>

                    {/* Logo */}
                    <Link
                        href="/"
                        className={styles.logo}
                    >
                        <span className={styles.logoIcon}>
                            +
                        </span>

                        <span className={styles.logoText}>
                            Medilocate
                        </span>
                    </Link>


                    {/* Desktop Navigation */}
                    <nav className={styles.navLinks}>

                        <Link href="/doctors">
                            Find Doctors
                        </Link>

                        <Link href="/medicines">
                            Medicines
                        </Link>

                        <Link href="/how-it-works">
                            How It Works
                        </Link>

                    </nav>


                    {/* Right Actions */}
                    <div className={styles.navActions}>

                        <Link
                            href="/login"
                            className={styles.loginButton}
                        >
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className={styles.navCta}
                        >
                            Get Started
                        </Link>

                    </div>


                    {/* Mobile Menu */}
                    <button
                        type="button"
                        className={styles.mobileMenu}
                        aria-label="Open navigation menu"
                    >
                        <MenuIcon />
                    </button>

                </div>

            </div>
        </header>
    );
}