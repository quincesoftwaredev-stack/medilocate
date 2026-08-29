import Head from "next/head";
import Link from "next/link";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import styles from "@/styles/Info/PublicInfo.module.css";

export default function ContactPage() {
    return (
        <>
            <Head>
                <title>Contact Us | MediLocate</title>
                <meta name="description" content="Contact MediLocate for help with doctors, prescriptions and medicine orders." />
            </Head>
            <main className={styles.page}>
                <header className={styles.hero}>
                    <div className={styles.container}>
                        <span>CONTACT MEDILOCATE</span>
                        <h1>We’re here to help.</h1>
                        <p>Tell us what you need help with and our support team will guide you.</p>
                    </div>
                </header>
                <section className={`${styles.container} ${styles.section}`}>
                    <div className={styles.contactGrid}>
                        <a href="mailto:support@medilocate.com" className={styles.contactCard}>
                            <EmailOutlinedIcon /><div><span>EMAIL</span><h2>support@medilocate.com</h2><p>For account, prescription and order support.</p></div>
                        </a>
                        <article className={styles.contactCard}>
                            <LocationOnOutlinedIcon /><div><span>LOCATION</span><h2>Rangpur, Bangladesh</h2><p>Serving patients and medicine customers locally.</p></div>
                        </article>
                        <article className={styles.contactCard}>
                            <ScheduleOutlinedIcon /><div><span>SUPPORT HOURS</span><h2>Every day</h2><p>Send us an email anytime and we’ll respond as soon as possible.</p></div>
                        </article>
                    </div>
                    <div className={styles.cta}>
                        <div><span>NEED A QUICK ANSWER?</span><h2>Visit the Help Center first.</h2></div>
                        <div className={styles.actions}><Link href="/help">Open Help Center <ArrowForwardRoundedIcon /></Link></div>
                    </div>
                </section>
            </main>
        </>
    );
}
