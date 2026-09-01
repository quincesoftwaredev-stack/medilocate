import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import { parse } from "cookie";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import styles from "@/styles/Admin/Bookings.module.css";
import BASE_URL from "@/config";

const STATUS_OPTIONS = ["all", "awaiting-payment", "payment-verification-pending", "pending", "confirmed", "reschedule-requested", "rescheduled", "completed", "cancelled", "no-show"];
const PAYMENT_OPTIONS = ["all", "unpaid", "verification-pending", "paid", "rejected", "refund-pending", "refunded"];
const MODE_OPTIONS = ["all", "chamber", "online", "home-visit"];
const FINAL_STATUSES = ["completed", "cancelled", "no-show"];

const label = (value = "") => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-BD", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(value)) : "—";
const shortRef = (booking) => `ML-${String(booking?._id || "").slice(-8).toUpperCase()}`;

export default function AdminAppointmentsPage({ initialBookings = [], totalPages = 0, count = 0, currentPage = 1 }) {
  const router = useRouter();
  const userInfo = useSelector((state) => state.user?.userInfo);
  const [bookings, setBookings] = useState(initialBookings);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    setBookings(initialBookings);
    setSelected(null);
  }, [initialBookings]);

  const filters = useMemo(() => ({
    query: String(router.query.query || ""),
    status: String(router.query.status || "all"),
    paymentStatus: String(router.query.paymentStatus || "all"),
    mode: String(router.query.mode || "all"),
    date: String(router.query.date || ""),
  }), [router.query]);

  const updateQuery = (values) => router.push({ pathname: "/admin/booking", query: { ...router.query, ...values, page: 1 } });
  const updateBooking = (updated) => {
    const mergeBooking = (current) => ({
      ...current,
      ...updated,
      patient: updated.patient && typeof updated.patient === "object" ? updated.patient : current.patient,
      doctor: updated.doctor && typeof updated.doctor === "object" ? updated.doctor : current.doctor,
    });
    setBookings((items) => items.map((item) => item._id === updated._id ? mergeBooking(item) : item));
    setSelected((current) => current?._id === updated._id ? mergeBooking(current) : current);
  };
  const headers = { Authorization: `Bearer ${userInfo?.token || ""}` };

  const bookingAction = async (action) => {
    if (!selected) return;
    setBusy(action); setNotice("");
    try {
      const { data } = await axios.patch(`/api/booking/${selected._id}`, { action }, { headers });
      updateBooking(data); setNotice(`Appointment marked ${label(data.status)}.`);
    } catch (error) { setNotice(error.response?.data?.error || "Appointment could not be updated."); }
    finally { setBusy(""); }
  };

  const paymentAction = async (action) => {
    if (!selected?.payment?._id) return;
    if (action === "reject" && !rejecting) { setRejecting(true); return; }
    setBusy(`payment-${action}`); setNotice("");
    try {
      const { data } = await axios.patch(`/api/admin/booking-payments/${selected.payment._id}`, { action, reason: rejectReason }, { headers });
      updateBooking({ ...data.booking, payment: data.payment });
      setRejecting(false); setRejectReason(""); setNotice(action === "verify" ? "Payment verified." : "Payment rejected and slot released.");
    } catch (error) { setNotice(error.response?.data?.error || "Payment could not be updated."); }
    finally { setBusy(""); }
  };

  return <>
    <Head><title>Appointments | MediLocate Admin</title></Head>
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.titleIcon}><EventAvailableOutlinedIcon /></div>
        <div><span>MEDILOCATE ADMIN</span><h1>Appointment management</h1><p>Review bookings, verify manual payments and manage appointment status.</p></div>
        <div className={styles.total}><strong>{count}</strong><span>Total appointments</span></div>
      </section>

      <section className={styles.filters}>
        <div className={styles.search}><SearchOutlinedIcon /><input defaultValue={filters.query} placeholder="Patient, doctor, phone or booking ID" onKeyDown={(event) => event.key === "Enter" && updateQuery({ query: event.currentTarget.value })} /><button type="button" onClick={(event) => updateQuery({ query: event.currentTarget.parentElement.querySelector("input").value })}>Search</button></div>
        <div className={styles.filterGrid}>
          <label><span>Status</span><select value={filters.status} onChange={(e) => updateQuery({ status: e.target.value })}>{STATUS_OPTIONS.map((item) => <option value={item} key={item}>{label(item)}</option>)}</select></label>
          <label><span>Payment</span><select value={filters.paymentStatus} onChange={(e) => updateQuery({ paymentStatus: e.target.value })}>{PAYMENT_OPTIONS.map((item) => <option value={item} key={item}>{label(item)}</option>)}</select></label>
          <label><span>Mode</span><select value={filters.mode} onChange={(e) => updateQuery({ mode: e.target.value })}>{MODE_OPTIONS.map((item) => <option value={item} key={item}>{label(item)}</option>)}</select></label>
          <label><span>Date</span><input type="date" value={filters.date} onChange={(e) => updateQuery({ date: e.target.value })} /></label>
          <button className={styles.clear} type="button" onClick={() => router.push("/admin/booking")}><TuneOutlinedIcon /> Clear</button>
        </div>
      </section>

      <section className={styles.listCard}>
        <div className={styles.tableWrap}><table><thead><tr><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Schedule</th><th>Mode</th><th>Payment</th><th>Status</th><th></th></tr></thead><tbody>
          {bookings.map((booking) => <tr key={booking._id}>
            <td><strong>{shortRef(booking)}</strong><small>{formatDate(booking.createdAt)}</small></td>
            <td><strong>{booking.patientName || booking.patient?.fullName || "Patient"}</strong><small>{booking.patientPhone || booking.patient?.phoneNumber || booking.patient?.phone || "—"}</small></td>
            <td><strong>{booking.doctor?.fullName || "Doctor"}</strong><small>{booking.doctor?.speciality || "—"}</small></td>
            <td><strong>{formatDate(booking.appointmentDate)}</strong><small>{booking.consultationMode === "chamber" ? `Serial ${booking.serial} · approx. ${booking.startTime}` : `${booking.startTime}–${booking.endTime}`}</small></td>
            <td><span className={styles.mode}>{label(booking.consultationMode)}</span></td>
            <td><span className={`${styles.badge} ${styles[booking.paymentStatus] || ""}`}>{label(booking.paymentStatus)}</span><small>৳{Number(booking.consultationFee || 0).toLocaleString("en-BD")}</small></td>
            <td><span className={`${styles.badge} ${styles[booking.status] || ""}`}>{label(booking.status)}</span></td>
            <td><button className={styles.view} type="button" onClick={() => { setSelected(booking); setNotice(""); setRejecting(false); }}>Manage</button></td>
          </tr>)}
        </tbody></table></div>
        {!bookings.length && <div className={styles.empty}><EventAvailableOutlinedIcon /><strong>No appointments found</strong><span>Try changing the current filters.</span></div>}
      </section>

      <nav className={styles.pagination} aria-label="Appointments pagination">
        <button type="button" className={styles.pageDirection} disabled={currentPage <= 1} onClick={() => router.push({ pathname: "/admin/booking", query: { ...router.query, page: currentPage - 1 } })}>Previous</button>
        {Array.from({ length: Math.max(totalPages, 1) }, (_, index) => index + 1).map((page) => <button type="button" className={page === currentPage ? styles.current : ""} key={page} aria-current={page === currentPage ? "page" : undefined} onClick={() => router.push({ pathname: "/admin/booking", query: { ...router.query, page } })}>{page}</button>)}
        <button type="button" className={styles.pageDirection} disabled={currentPage >= Math.max(totalPages, 1)} onClick={() => router.push({ pathname: "/admin/booking", query: { ...router.query, page: currentPage + 1 } })}>Next</button>
      </nav>
    </main>

    {selected && <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><aside className={styles.drawer}>
      <header><div><small>{shortRef(selected)}</small><h2>Appointment details</h2></div><button type="button" onClick={() => setSelected(null)}><CloseOutlinedIcon /></button></header>
      {notice && <p className={styles.notice}>{notice}</p>}
      <div className={styles.detailGrid}>
        <div><span>Patient</span><strong>{selected.patientName || selected.patient?.fullName || "Patient"}</strong><small>{selected.patientPhone || selected.patient?.phoneNumber || selected.patient?.phone || "—"}</small></div>
        <div><span>Doctor</span><strong>{selected.doctor?.fullName || "Doctor"}</strong><small>{selected.doctor?.phoneNumber || selected.doctor?.phone || "—"}</small></div>
        <div><span>Appointment</span><strong>{formatDate(selected.appointmentDate)}</strong><small>{selected.consultationMode === "chamber" ? `Serial ${selected.serial}, estimated ${selected.startTime}` : `${selected.startTime}–${selected.endTime}`}</small></div>
        <div><span>Mode & fee</span><strong>{label(selected.consultationMode)}</strong><small>৳{Number(selected.consultationFee || 0).toLocaleString("en-BD")}</small></div>
      </div>
      {selected.homeVisitAddress?.address && <section className={styles.block}><span>Home visit address</span><p>{selected.homeVisitAddress.address}</p></section>}
      {(selected.symptoms || selected.patientNotes) && <section className={styles.block}><span>Patient notes</span><p>{selected.symptoms || selected.patientNotes}</p></section>}
      <section className={styles.paymentBlock}><div className={styles.blockTitle}><PaymentsOutlinedIcon /><div><span>Manual payment</span><strong>{label(selected.paymentStatus)}</strong></div></div>
        {selected.payment ? <div className={styles.paymentData}><div><span>Transaction ID</span><strong>{selected.payment.transactionId}</strong></div><div><span>Amount</span><strong>৳{Number(selected.payment.amount || 0).toLocaleString("en-BD")}</strong></div><div><span>Sender last 4</span><strong>{selected.payment.senderPhoneLast4 || "—"}</strong></div><div><span>Submitted</span><strong>{formatDate(selected.payment.submittedAt)}</strong></div></div> : <p>No transaction submitted yet.</p>}
        {selected.payment?.status === "verification-pending" && <div className={styles.paymentActions}><button type="button" disabled={Boolean(busy)} onClick={() => paymentAction("verify")}>Verify payment</button><button type="button" className={styles.dangerOutline} disabled={Boolean(busy)} onClick={() => paymentAction("reject")}>Reject</button></div>}
        {rejecting && <div className={styles.rejectBox}><textarea placeholder="Reason for rejection" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} /><div><button type="button" onClick={() => setRejecting(false)}>Back</button><button type="button" disabled={!rejectReason.trim() || Boolean(busy)} onClick={() => paymentAction("reject")}>Confirm rejection</button></div></div>}
      </section>
      {!FINAL_STATUSES.includes(selected.status) && <section className={styles.statusActions}><span>Appointment actions</span><div>{selected.paymentStatus === "paid" && !["confirmed", "rescheduled"].includes(selected.status) && <button type="button" disabled={Boolean(busy)} onClick={() => bookingAction("confirm")}>Confirm appointment</button>}{["confirmed", "rescheduled"].includes(selected.status) && <button type="button" disabled={Boolean(busy)} onClick={() => bookingAction("complete")}>Mark completed</button>}{["confirmed", "rescheduled"].includes(selected.status) && <button type="button" disabled={Boolean(busy)} onClick={() => bookingAction("no-show")}>Mark no-show</button>}<button type="button" className={styles.dangerOutline} disabled={Boolean(busy)} onClick={() => bookingAction("cancel")}>Cancel booking</button></div></section>}
    </aside></div>}
  </>;
}

export async function getServerSideProps(context) {
  try {
    const cookies = parse(context.req.headers.cookie || "");
    const userInfo = cookies.userInfo ? JSON.parse(cookies.userInfo) : null;
    if (!userInfo?.token || userInfo.role !== "admin") return { redirect: { destination: "/login", permanent: false } };
    const params = { page: context.query.page || 1, query: context.query.query || "", status: context.query.status || "all", paymentStatus: context.query.paymentStatus || "all", mode: context.query.mode || "all", date: context.query.date || "" };
    const { data } = await axios.get(`${BASE_URL}/api/booking`, { params, headers: { Authorization: `Bearer ${userInfo.token}` } });
    return { props: { initialBookings: JSON.parse(JSON.stringify(data.bookings || [])), totalPages: data.totalPages || 0, count: data.count || 0, currentPage: data.page || 1 } };
  } catch (error) {
    console.error("Admin appointments SSR error", error.response?.data || error.message);
    return { props: { initialBookings: [], totalPages: 0, count: 0, currentPage: 1 } };
  }
}
