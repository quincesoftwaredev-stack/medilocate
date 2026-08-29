import Head from "next/head";
import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

import styles from "@/styles/Info/PublicInfo.module.css";

const steps = [
    { icon: MedicalServicesOutlinedIcon, title: "Find trusted care", text: "Search verified doctors by name or specialty and review their profile before choosing care." },
    { icon: LocalPharmacyOutlinedIcon, title: "Choose medicines", text: "Browse medicines, check availability and add the items you need to your cart." },
    { icon: DescriptionOutlinedIcon, title: "Upload a prescription", text: "Send your prescription securely when you want our pharmacy team to prepare the order for you." },
    { icon: LocalShippingOutlinedIcon, title: "Order and track", text: "Confirm your delivery information, place the order and follow its progress from your orders page." },
];

export default function HowItWorksPage() {
    return (
        <>
            <Head>
                <title>How It Works | MediLocate</title>
                <meta name="description" content="Learn how to find doctors and order medicines with MediLocate." />
            </Head>
            <main className={styles.page}>
                <header className={styles.hero}>
                    <div className={styles.container}>
                        <span>HOW IT WORKS</span>
                        <h1>Healthcare, made easier.</h1>
                        <p>Find care, upload a prescription or order medicines in a few clear steps.</p>
                    </div>
                </header>
                <section className={`${styles.container} ${styles.section}`}>
                    <div className={styles.stepGrid}>
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <article className={styles.stepCard} key={step.title}>
                                    <div className={styles.stepTop}><span>{index + 1}</span><Icon /></div>
                                    <h2>{step.title}</h2>
                                    <p>{step.text}</p>
                                </article>
                            );
                        })}
                    </div>
                    <div className={styles.cta}>
                        <div><span>READY TO BEGIN?</span><h2>Choose the service you need.</h2></div>
                        <div className={styles.actions}>
                            <Link href="/doctors">Find a doctor <ArrowForwardRoundedIcon /></Link>
                            <Link href="/medicines" className={styles.secondary}>Browse medicines</Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
