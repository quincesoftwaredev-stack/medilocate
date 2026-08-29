import Head from "next/head";
import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import styles from "@/styles/Info/PublicInfo.module.css";

const topics = [
    { icon: MedicalServicesOutlinedIcon, title: "Finding a doctor", text: "Use search or the doctor directory, then open a profile to see specialty and availability.", href: "/doctors" },
    { icon: DescriptionOutlinedIcon, title: "Prescription orders", text: "Upload a clear prescription image and follow the instructions before submitting your request.", href: "/prescription" },
    { icon: LocalShippingOutlinedIcon, title: "Orders and delivery", text: "Open My Orders to review the current status and details of your medicine order.", href: "/orders" },
];

const questions = [
    ["Do I need an account?", "You can browse doctors and medicines without an account. An account may be required when placing or tracking an order."],
    ["Why does a medicine require a prescription?", "Prescription-only medicines need a valid prescription before the pharmacy team can process the order."],
    ["Where can I see my order?", "Open the Orders page after signing in. Select an order to see its current status and details."],
];

export default function HelpPage() {
    return (
        <>
            <Head><title>Help Center | MediLocate</title><meta name="description" content="Get help using MediLocate doctor, prescription and medicine-order services." /></Head>
            <main className={styles.page}>
                <header className={styles.hero}><div className={styles.container}><span>HELP CENTER</span><h1>How can we help?</h1><p>Quick guidance for the most common MediLocate tasks.</p></div></header>
                <section className={`${styles.container} ${styles.section}`}>
                    <div className={styles.topicGrid}>
                        {topics.map((topic) => { const Icon = topic.icon; return (
                            <Link href={topic.href} className={styles.topicCard} key={topic.title}><Icon /><h2>{topic.title}</h2><p>{topic.text}</p><strong>Open service <ArrowForwardRoundedIcon /></strong></Link>
                        ); })}
                    </div>
                    <div className={styles.faq}><span>COMMON QUESTIONS</span><h2>Frequently asked questions</h2>{questions.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
                    <div className={styles.cta}><div><span>STILL NEED HELP?</span><h2>Contact our support team.</h2></div><div className={styles.actions}><Link href="/contact">Contact us <ArrowForwardRoundedIcon /></Link></div></div>
                </section>
            </main>
        </>
    );
}
