import Link from "next/link";
import { useRouter } from "next/router";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import styles from "@/styles/User/BottomNav.module.css";

export default function UserBottomNav({ userInfo }) {
  const router = useRouter();
  const userId = userInfo?._id || userInfo?.id;
  const accountHref = userId ? `/profile/${userId}` : "/login";
  const appointmentsHref = userId ? `/profile/${userId}/consultations` : "/login";
  const ordersHref = userId ? "/orders" : "/login";
  const items = [
    ["Home", "/", HomeOutlinedIcon],
    ["Doctors", "/doctors", MedicalServicesOutlinedIcon],
    ["Medicines", "/medicines", MedicationOutlinedIcon],
    ["Cart", "/cart", ShoppingCartOutlinedIcon],
    ["Appointments", appointmentsHref, CalendarMonthOutlinedIcon],
    ["Orders", ordersHref, ShoppingBagOutlinedIcon],
    [userId ? "Profile" : "Login", accountHref, AccountCircleOutlinedIcon],
  ];
  return <nav className={styles.nav} aria-label="Mobile navigation">
    {items.map(([label, href, Icon]) => {
      const active = href === "/" ? router.pathname === "/"
        : href === accountHref && userId ? router.pathname.startsWith("/profile/") || router.pathname.startsWith("/consultation/")
        : router.pathname === href || router.pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ""}`}>
        <Icon /><span>{label}</span>
      </Link>;
    })}
  </nav>;
}
