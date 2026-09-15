import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import styles from "@/styles/User/Consultations.module.css";

const terminal = ["completed", "cancelled", "rejected", "no-show"];
const modeOf = (item) => item.consultationType || (item.consultationMode === "home-visit" ? "home" : item.consultationMode);
const startsAt = (item) => {
  if (item.scheduledAt) {
    const scheduled = new Date(item.scheduledAt);
    return Number.isNaN(scheduled.getTime()) ? null : scheduled;
  }
  const rawDate = String(item.appointmentDate || "");
  const date = rawDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const time = String(item.startTime || "00:00").match(/^\d{1,2}:\d{2}/)?.[0];
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time.padStart(5, "0")}:00+06:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const showDate = (item) => {
  const date = startsAt(item);
  return date
    ? new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(date)
    : "Date unavailable";
};
const label = (value) => String(value || "").replaceAll("-", " ");

export default function ConsultationsPage() {
  const router = useRouter();
  const storedUserInfo = useSelector((state) => state.user?.userInfo);
  const [hydrated, setHydrated] = useState(false);
  const userInfo = hydrated ? storedUserInfo : null;
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const ownId = String(userInfo?._id || userInfo?.id || "");

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!userInfo?.token || userInfo?.role !== "patient") return;
    axios.get("/api/booking/my", { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setBookings(data.bookings || []))
      .catch((requestError) => setError(requestError.response?.data?.error || "Your consultations could not be loaded."));
  }, [userInfo?.role, userInfo?.token]);

  const upcoming = useMemo(() => bookings.filter((item) => !terminal.includes(item.status) && startsAt(item) >= new Date()), [bookings]);
  const past = useMemo(() => bookings.filter((item) => !upcoming.includes(item)), [bookings, upcoming]);

  if (!hydrated || userInfo?.role !== "patient" || !userInfo?.token || (router.isReady && String(router.query.id) !== ownId)) {
    return <main className={styles.gate}>Sign in to view your consultations. <Link href="/login">Sign in</Link></main>;
  }

  const bookingCard = (item) => {
    const mode = modeOf(item);
    const joinable = mode === "online" && ["confirmed", "rescheduled", "waiting", "ongoing"].includes(item.status);
    return <article className={styles.bookingCard} key={item._id}>
      <div className={styles.bookingIcon}>{mode === "online" ? <VideoCallOutlinedIcon /> : mode === "chamber" ? <MedicalServicesOutlinedIcon /> : <LocationOnOutlinedIcon />}</div>
      <div className={styles.bookingMain}><div className={styles.bookingTitle}><div><span>{label(mode)} consultation</span><h3>Dr. {item.doctor?.fullName || "Doctor"}</h3></div><span className={styles.status} data-status={item.status}>{label(item.status)}</span></div>
        <div className={styles.bookingMeta}><span><CalendarMonthOutlinedIcon />{showDate(item)}</span><strong>{"\u09F3"}{Number(item.consultationFee || 0).toLocaleString("en-BD")}</strong></div>
        <div className={styles.cardActions}><button type="button" onClick={() => setSelected(item)}>View details <ArrowForwardRoundedIcon /></button>{joinable && <Link href={`/consultation/${item._id}`}><VideoCallOutlinedIcon /> Join consultation</Link>}</div>
      </div>
    </article>;
  };
  const chamber = selected?.doctorProfile?.chambers?.find((item) => String(item._id) === String(selected.chamberId));

  return <>
    <Head><title>My Consultations | MediLocate</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main className={styles.page}><div className={styles.container}>
      <Link href={`/profile/${ownId}`} className={styles.backLink}><ArrowBackRoundedIcon /> Back to profile</Link>
      <header className={styles.pageHeader}><div><span className={styles.eyebrow}>MY HEALTHCARE</span><h1>My consultations</h1><p>View appointments, booking details and online consultation links.</p></div><div className={styles.summary}><div><strong>{bookings.length}</strong><span>Total</span></div><div><strong>{upcoming.length}</strong><span>Upcoming</span></div><div><strong>{past.length}</strong><span>Previous</span></div></div></header>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <section className={styles.section}><div className={styles.sectionHeader}><div><span>UP NEXT</span><h2>Upcoming consultations</h2></div><strong>{upcoming.length}</strong></div><div className={styles.list}>{upcoming.length ? upcoming.map(bookingCard) : <div className={styles.empty}><CalendarMonthOutlinedIcon /><h3>No upcoming consultation</h3><p>Book a doctor when you need medical guidance.</p><Link href="/doctors">Find a doctor</Link></div>}</div></section>
      <section className={styles.section}><div className={styles.sectionHeader}><div><span>HISTORY</span><h2>Previous consultations</h2></div><strong>{past.length}</strong></div><div className={styles.list}>{past.length ? past.map(bookingCard) : <div className={styles.empty}><MedicalServicesOutlinedIcon /><h3>No consultation history</h3><p>Your completed and cancelled consultations will appear here.</p></div>}</div></section>
    </div></main>
    {selected && <div className={styles.overlay} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Consultation booking details">
      <div className={styles.drawerHeader}><div><span>BOOKING DETAILS</span><h2>Consultation</h2></div><button type="button" aria-label="Close" onClick={() => setSelected(null)}><CloseRoundedIcon /></button></div>
      <div className={styles.detailDoctor}><div className={styles.bookingIcon}><MedicalServicesOutlinedIcon /></div><div><span>Doctor</span><strong>Dr. {selected.doctor?.fullName || "Doctor"}</strong></div></div>
      <dl className={styles.details}><div><dt>Date and time</dt><dd>{showDate(selected)}</dd></div><div><dt>Consultation type</dt><dd>{label(modeOf(selected))}</dd></div><div><dt>Status</dt><dd>{label(selected.status)}</dd></div><div><dt>Fee</dt><dd>{"\u09F3"}{Number(selected.consultationFee || 0).toLocaleString("en-BD")}</dd></div>
        {modeOf(selected) === "chamber" && <div><dt>Chamber</dt><dd>{chamber ? `${chamber.name}, ${chamber.address}` : "Details unavailable"}{selected.serial ? ` · Serial ${selected.serial}` : ""}</dd></div>}
        {modeOf(selected) === "home" && <div><dt>Visit address</dt><dd>{selected.homeVisitAddress?.address || "Not provided"}</dd></div>}
      </dl>
      {modeOf(selected) === "online" && ["confirmed", "rescheduled", "waiting", "ongoing"].includes(selected.status) && <Link className={styles.joinButton} href={`/consultation/${selected._id}`}><VideoCallOutlinedIcon /> Open online consultation</Link>}
    </aside></div>}
  </>;
}
