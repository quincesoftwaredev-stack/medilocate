import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

import styles from "@/styles/Admin/NewAdmin.module.css";

const actions = [
    { label: "Process orders", description: "Prepare pending medicine orders", href: "/admin/orders?status=pending", icon: ShoppingBagOutlinedIcon },
    { label: "Review prescriptions", description: "Process uploaded prescriptions", href: "/admin/prescriptions", icon: DescriptionOutlinedIcon },
    { label: "Add medicine", description: "Create a new catalogue medicine", href: "/admin/medicines/new", icon: MedicationOutlinedIcon },
    { label: "Review doctors", description: "Verify pending doctor profiles", href: "/admin/doctors?verification=pending", icon: MedicalServicesOutlinedIcon },
];

export default function QuickActions() {
    return (
        <section className={styles.quickSection}>
            <div className={styles.sectionHeading}>
                <div>
                    <span className={styles.panelEyebrow}>SHORTCUTS</span>
                    <h2>Quick actions</h2>
                </div>
                <p>Jump directly to the areas you manage most.</p>
            </div>

            <div className={styles.quickGrid}>
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link key={action.href} href={action.href} className={styles.quickCard}>
                            <span className={styles.quickIcon}><Icon /></span>
                            <span className={styles.quickCopy}>
                                <strong>{action.label}</strong>
                                <small>{action.description}</small>
                            </span>
                            <ArrowForwardRoundedIcon className={styles.quickArrow} />
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
