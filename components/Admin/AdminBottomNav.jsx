import Link from "next/link";
import { useRouter } from "next/router";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

import styles from "@/styles/Admin/AdminBottomNav.module.css";

const navItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: DashboardOutlinedIcon,
    },
    {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingBagOutlinedIcon,
    },
    {
        label: "Medicines",
        href: "/admin/medicines",
        icon: MedicationOutlinedIcon,
    },
    {
        label: "Prescriptions",
        href: "/admin/prescriptions",
        icon: DescriptionOutlinedIcon,
    },
    {
        label: "Doctors",
        href: "/admin/doctors",
        icon: MedicalServicesOutlinedIcon,
    },
];

export default function AdminBottomNav() {

    const router = useRouter();

    const isActive = (href) => {

        if (href === "/admin") {
            return router.pathname === "/admin";
        }

        return (
            router.pathname === href ||
            router.pathname.startsWith(
                `${href}/`
            )
        );

    };


    return (
        <nav className={styles.nav}>

            <div className={styles.inner}>

                {navItems.map((item) => {

                    const Icon = item.icon;

                    const active =
                        isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.item} ${
                                active
                                    ? styles.active
                                    : ""
                            }`}
                        >

                            <span className={styles.icon}>

                                <Icon />

                            </span>


                            <span className={styles.label}>

                                {item.label}

                            </span>

                        </Link>
                    );

                })}

            </div>

        </nav>
    );
}