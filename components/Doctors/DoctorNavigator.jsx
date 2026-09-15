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
import styles from "@/styles/Doctor/Dashboard.module.css";

const links = [
  ["overview", "Overview", DashboardOutlinedIcon],
  ["appointments", "Appointments", EventAvailableOutlinedIcon],
  ["video", "Video consultations", VideoCallOutlinedIcon],
  ["schedule", "Schedule", ScheduleOutlinedIcon],
  ["chambers", "Chambers", BusinessOutlinedIcon],
  ["patients", "Patients", PeopleOutlinedIcon],
  ["earnings", "Earnings", PaymentsOutlinedIcon],
  ["profile", "Profile", PersonOutlineOutlinedIcon],
];

export default function DoctorNavigator() {
  const router = useRouter();
  const current = String(router.query.tab || "overview");
  return <nav className={styles.navigator} aria-label="Doctor dashboard navigation">
    <strong>MediLocate Doctor</strong>
    {links.map(([tab, label, Icon]) => <Link key={tab} href={tab === "overview" ? "/doctor" : `/doctor?tab=${tab}`}
      className={current === tab ? styles.activeNav : ""}><Icon fontSize="small" /><span>{label}</span></Link>)}
  </nav>;
}
