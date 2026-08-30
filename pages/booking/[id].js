import Head from "next/head";
import Link from "next/link";
import { parse } from "cookie";

import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import styles from "@/styles/Info/PublicInfo.module.css";

const displayDate = (value) => value
    ? new Intl.DateTimeFormat("en-BD", { dateStyle: "long" }).format(new Date(value))
    : "To be confirmed";

export default function BookingDetailsPage({ booking }) {
    const doctor = booking.doctor || {};
    const doctorName = doctor.fullName || [doctor.firstName, doctor.lastName].filter(Boolean).join(" ") || "Your doctor";

    return (
        <>
            <Head><title>Appointment Details | MediLocate</title></Head>
            <main className={styles.page}>
                <header className={styles.hero}><div className={styles.container}><span>APPOINTMENT</span><h1>Booking details</h1><p>Review the latest information for your doctor appointment.</p></div></header>
                <section className={`${styles.container} ${styles.bookingSection}`}>
                    <Link href="/doctors" className={styles.backLink}><ArrowBackRoundedIcon /> Back to doctors</Link>
                    <article className={styles.bookingCard}>
                        <div className={styles.bookingHeader}>
                            <div><span>BOOKING REFERENCE</span><h2>Serial #{booking.serial || "—"}</h2></div>
                            <strong className={styles.status}>{String(booking.status || "pending").replaceAll("-", " ")}</strong>
                        </div>
                        <div className={styles.bookingGrid}>
                            <div><MedicalServicesOutlinedIcon /><span>Doctor</span><strong>{doctorName}</strong></div>
                            <div><CalendarMonthOutlinedIcon /><span>Date</span><strong>{displayDate(booking.appointmentDate || booking.dateOfConsultation)}</strong></div>
                            <div><ScheduleOutlinedIcon /><span>Time</span><strong>{booking.startTime ? `${booking.startTime}${booking.endTime ? ` – ${booking.endTime}` : ""}` : "To be confirmed"}</strong></div>
                            <div><PaymentsOutlinedIcon /><span>Consultation fee</span><strong>৳{Number(booking.consultationFee || 0).toLocaleString("en-BD")}</strong></div>
                        </div>
                    </article>
                </section>
            </main>
        </>
    );
}

export async function getServerSideProps({ params, req }) {
    const cookies = parse(req.headers.cookie || "");
    let userInfo = null;
    try {
        userInfo = cookies.userInfo ? JSON.parse(cookies.userInfo) : null;
    } catch {
        userInfo = null;
    }
    if (!userInfo?.token) {
        return { redirect: { destination: `/login?redirectTo=/booking/${encodeURIComponent(params.id)}`, permanent: false } };
    }

    try {
        const protocol = req.headers["x-forwarded-proto"] || "http";
        const response = await fetch(`${protocol}://${req.headers.host}/api/booking/${encodeURIComponent(params.id)}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (response.status === 403) return { notFound: true };
        if (!response.ok) return { notFound: true };
        return { props: { booking: await response.json() } };
    } catch {
        return { notFound: true };
    }
}
