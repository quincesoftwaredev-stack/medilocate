import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { logout } from "@/redux/userSlice";
import styles from "@/styles/Profile/Profile.module.css";

const terminalStatuses = ["completed", "cancelled", "rejected", "no-show"];
const bookingDate = (item) => {
  if (item.scheduledAt) return new Date(item.scheduledAt);
  const date = String(item.appointmentDate || "").slice(0, 10);
  const time = String(item.startTime || "00:00").slice(0, 5);
  return new Date(`${date}T${time}:00+06:00`);
};

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const storedUserInfo = useSelector((state) => state.user?.userInfo);
  const [hydrated, setHydrated] = useState(false);
  const userInfo = hydrated ? storedUserInfo : null;
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [hasAddress, setHasAddress] = useState(false);
  const [error, setError] = useState("");
  const ownId = String(userInfo?._id || userInfo?.id || "");

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!userInfo?.token || ["admin", "doctor"].includes(userInfo?.role)) return;
    setHasAddress(Boolean(localStorage.getItem("medilocate_saved_address")));
    const headers = { Authorization: `Bearer ${userInfo.token}` };
    Promise.all([axios.get(`/api/user/${userInfo._id || userInfo.id}`, { headers }), axios.get("/api/booking/my", { headers })])
      .then(([profileResponse, bookingResponse]) => {
        setProfile(profileResponse.data);
        setBookings(bookingResponse.data.bookings || []);
      })
      .catch((requestError) => setError(requestError.response?.data?.error || "Your profile could not be loaded."));
  }, [userInfo?._id, userInfo?.id, userInfo?.role, userInfo?.token]);

  const stats = useMemo(() => {
    const upcoming = bookings.filter((item) => !terminalStatuses.includes(item.status) && bookingDate(item) && bookingDate(item) >= new Date()).length;
    const completed = bookings.filter((item) => item.status === "completed").length;
    return { total: bookings.length, upcoming, completed };
  }, [bookings]);

  if (!hydrated || ["admin", "doctor"].includes(userInfo?.role) || !userInfo?.token || (router.isReady && String(router.query.id) !== ownId)) {
    return <main className={styles.page}><div className={styles.container}>Sign in to view your profile. <Link href="/login">Sign in</Link></div></main>;
  }

  const name = profile?.fullName || userInfo.fullName || "MediLocate user";
  const phone = profile?.phone || profile?.phoneNumber || userInfo.phone || "Not added";
  const email = profile?.email || "Not added";
  const firstName = name.split(" ")[0];
  const signOut = () => { dispatch(logout()); router.push("/login"); };

  return <>
    <Head><title>My Profile | MediLocate</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main className={styles.page}><div className={styles.container}>
      <header className={styles.pageHeader}><span className={styles.eyebrow}>MY ACCOUNT</span><h1>Welcome back, <span>{firstName}.</span></h1><p>Manage your profile, consultations, prescriptions and delivery information.</p></header>
      {error && <p role="alert">{error}</p>}
      <section className={styles.profileCard}><div className={styles.profileMain}>
        <div className={styles.avatar}>{profile?.image ? <Image src={profile.image} alt={name} width={85} height={85} unoptimized /> : <span>{name.charAt(0).toUpperCase()}</span>}</div>
        <div className={styles.profileInfo}><div className={styles.profileNameRow}><div><h2>{name}</h2><span>MediLocate Patient</span></div><Link href={`/profile/update/${ownId}`} className={styles.editButton}><EditOutlinedIcon /> Edit Profile</Link></div>
          <div className={styles.profileMeta}><div><PhoneOutlinedIcon /><span>{phone}</span></div><div><EmailOutlinedIcon /><span>{email}</span></div><div><LocationOnOutlinedIcon /><span>{hasAddress ? "Saved delivery address" : "No saved address"}</span></div></div>
        </div>
      </div></section>
      <section className={styles.statsGrid}>
        <Link href={`/profile/${ownId}/consultations`} className={styles.statCard}><div className={styles.statIcon}><MedicalServicesOutlinedIcon /></div><div><span>Total Consultations</span><strong>{stats.total}</strong></div><ArrowForwardRoundedIcon /></Link>
        <Link href={`/profile/${ownId}/consultations`} className={styles.statCard}><div className={`${styles.statIcon} ${styles.activeIcon}`}><EventAvailableOutlinedIcon /></div><div><span>Upcoming</span><strong>{stats.upcoming}</strong></div><ArrowForwardRoundedIcon /></Link>
        <Link href={`/profile/${ownId}/consultations`} className={styles.statCard}><div className={`${styles.statIcon} ${styles.prescriptionIcon}`}><HistoryOutlinedIcon /></div><div><span>Completed</span><strong>{stats.completed}</strong></div><ArrowForwardRoundedIcon /></Link>
        <Link href="/checkout" className={styles.statCard}><div className={`${styles.statIcon} ${styles.addressIcon}`}><LocationOnOutlinedIcon /></div><div><span>Saved Address</span><strong>{hasAddress ? 1 : 0}</strong></div><ArrowForwardRoundedIcon /></Link>
      </section>
      <div className={styles.contentGrid}><div className={styles.mainColumn}>
        <section className={styles.prescriptionCard}><div className={styles.prescriptionVisual}><MedicalServicesOutlinedIcon /></div><div className={styles.prescriptionContent}><span>YOUR CARE</span><h2>Manage your consultations</h2><p>Review upcoming and previous appointments, see booking details and join online consultations.</p><Link href={`/profile/${ownId}/consultations`} className={styles.prescriptionButton}>View consultations <ArrowForwardRoundedIcon /></Link></div></section>
        <section className={styles.prescriptionCard}><div className={styles.prescriptionVisual}><DescriptionOutlinedIcon /></div><div className={styles.prescriptionContent}><span>MEDICINE SUPPORT</span><h2>Upload a prescription</h2><p>Send your prescription securely and let the pharmacy team prepare your medicine request.</p><Link href="/prescription" className={styles.prescriptionButton}>Upload prescription <ArrowForwardRoundedIcon /></Link></div></section>
      </div><aside className={styles.sidebar}>
        <section className={styles.card}><div className={styles.cardHeader}><div><span>ACCOUNT</span><h2>Personal information</h2></div><Link href={`/profile/update/${ownId}`} className={styles.iconEdit} aria-label="Edit profile"><EditOutlinedIcon /></Link></div><div className={styles.personalInfo}>
          <div><span>Full name</span><strong>{name}</strong></div><div><span>Phone number</span><strong>{phone}</strong></div><div><span>Email</span><strong>{email}</strong></div><div><span>Gender</span><strong>{profile?.gender || "Not added"}</strong></div>
        </div></section>
        <section className={styles.card}><div className={styles.cardHeader}><div><span>MANAGE</span><h2>Account</h2></div></div><div className={styles.accountMenu}>
          <Link href={`/profile/${ownId}/consultations`}><div className={styles.menuIcon}><MedicalServicesOutlinedIcon /></div><div><strong>My Consultations</strong><span>View appointments and video calls</span></div><ArrowForwardRoundedIcon /></Link>
          <Link href="/orders"><div className={styles.menuIcon}><PersonOutlineRoundedIcon /></div><div><strong>My Orders</strong><span>Track and view medicine orders</span></div><ArrowForwardRoundedIcon /></Link>
          <Link href="/prescription"><div className={styles.menuIcon}><DescriptionOutlinedIcon /></div><div><strong>Prescription Requests</strong><span>Upload and track prescriptions</span></div><ArrowForwardRoundedIcon /></Link>
          <Link href={`/profile/update/${ownId}`}><div className={styles.menuIcon}><SettingsOutlinedIcon /></div><div><strong>Profile Settings</strong><span>Update personal information</span></div><ArrowForwardRoundedIcon /></Link>
        </div></section>
        <button type="button" className={styles.logoutButton} onClick={signOut}><LogoutOutlinedIcon /> Sign out</button>
      </aside></div>
    </div></main>
  </>;
}
