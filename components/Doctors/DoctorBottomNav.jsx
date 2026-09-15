import Link from "next/link";
import { useRouter } from "next/router";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import styles from "@/styles/Doctor/DoctorBottomNav.module.css";

const items = [
  ["Overview", "/doctor", DashboardOutlinedIcon, "overview"],
  ["Appointments", "/doctor?tab=appointments", EventAvailableOutlinedIcon, "appointments"],
  ["Video", "/doctor?tab=video", VideoCallOutlinedIcon, "video"],
  ["Schedule", "/doctor?tab=schedule", ScheduleOutlinedIcon, "schedule"],
  ["Chambers", "/doctor?tab=chambers", BusinessOutlinedIcon, "chambers"],
  ["Patients", "/doctor?tab=patients", PeopleOutlinedIcon, "patients"],
  ["Earnings", "/doctor?tab=earnings", PaymentsOutlinedIcon, "earnings"],
];

export default function DoctorBottomNav({ userInfo }) {
  const router = useRouter();
  const doctorId = userInfo?._id || userInfo?.id;
  const isPublicProfile = router.pathname === "/doctors/[id]";
  const onDoctorPage = router.pathname.startsWith("/doctor") || router.pathname.startsWith("/consultation/") || isPublicProfile;
  const activeTab = router.pathname.startsWith("/consultation/")
    ? "video"
    : isPublicProfile ? "profile" : String(router.query.tab || "overview");
  const navItems = [
    ...items,
    ["Profile", doctorId ? `/doctors/${doctorId}` : "/doctor", PersonOutlineOutlinedIcon, "profile"],
  ];

  return <nav className={styles.nav} aria-label="Doctor dashboard navigation">
    {navItems.map(([label, href, Icon, tab]) => <Link key={tab} href={href}
      className={`${styles.item} ${onDoctorPage && activeTab === tab ? styles.active : ""}`}>
      <Icon /><span>{label}</span>
    </Link>)}
  </nav>;
}
