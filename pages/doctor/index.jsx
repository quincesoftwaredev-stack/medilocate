import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { showSnackBar } from "@/redux/notistackSlice";
import { startLoading, finishLoading } from "@/redux/stateSlice";
import axios from "axios";

import DoctorDashboardCharts from "@/components/Doctors/DoctorDashboardCharts";
import DoctorAvailabilityEditor, { createAvailabilityForm } from "@/components/Doctors/DoctorAvailabilityEditor";
import Pagination from "@/components/Utility/Pagination";
import styles from "@/styles/Doctor/Dashboard.module.css";

const LABELS = { online: "Online", chamber: "Chamber", home: "Home visit", "home-visit": "Home visit" };
const statusLabel = (value) => String(value || "").replaceAll("-", " ");
const formatDate = (booking) => new Intl.DateTimeFormat("en-BD", {
  timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric",
}).format(new Date(booking.appointmentDate));
const modeOf = (booking) => booking.consultationType || (booking.consultationMode === "home-visit" ? "home" : booking.consultationMode);

function AppointmentCard({ booking, open }) {
  const mode = modeOf(booking);
  return <article className={styles.appointment}>
    <div><strong>{booking.patientName || booking.patient?.fullName || "Patient"}</strong><span>{LABELS[mode]} · {formatDate(booking)} · {booking.startTime}–{booking.endTime}</span></div>
    <div><span className={styles.badge}>{statusLabel(booking.status)}</span><strong>৳{Number(booking.consultationFee || 0).toLocaleString("en-BD")}</strong></div>
    <button type="button" onClick={() => open(booking)}>View appointment</button>
    {mode === "online" && ["confirmed", "rescheduled", "waiting", "ongoing"].includes(booking.status) && <Link href={`/consultation/${booking._id}`}>Join video</Link>}
  </article>;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const storedUserInfo = useSelector((state) => state.user?.userInfo);
  const [hydrated, setHydrated] = useState(false);
  const userInfo = hydrated ? storedUserInfo : null;
  const token = userInfo?.token;
  const tab = String(router.query.tab || "overview");
  const [overview, setOverview] = useState(null);
  const [list, setList] = useState({ bookings: [], totalPages: 0, page: 1 });
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [form, setForm] = useState(null);
  const [profile, setProfile] = useState({ fullName: "", speciality: "", about: "", consultationFee: 0 });
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [busy, setBusy] = useState(false);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token || ""}` }), [token]);
  const navigate = (values) => router.push({ pathname: "/doctor", query: { ...router.query, ...values, page: 1 } });
  useEffect(() => {
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!router.isReady || !token || userInfo?.role !== "doctor") return;
    axios.get("/api/doctor/dashboard", { headers })
      .then(({ data }) => {
        setOverview(data);
        setForm(createAvailabilityForm(data.doctor));
        setProfile({
          fullName: data.doctor.user?.fullName || "", speciality: data.doctor.speciality || "",
          about: data.doctor.about || "", consultationFee: data.doctor.consultationFee || 0,
        });
      }).catch((error) => setNotice(error.response?.data?.error || "Dashboard could not be loaded."));
  }, [router.isReady, token, userInfo?.role, headers]);
  useEffect(() => {
    if (!token || userInfo?.role !== "doctor" || !["appointments", "video", "earnings"].includes(tab)) return;
    const params = {
      page: router.query.page || 1, mode: tab === "video" ? "online" : router.query.mode || "all",
      status: tab === "earnings" ? "completed" : router.query.status || "all",
      date: router.query.date || "", range: tab === "video" ? "upcoming" : router.query.range || "",
    };
    axios.get("/api/booking", { headers, params })
      .then(({ data }) => setList(data))
      .catch((error) => setNotice(error.response?.data?.error || "Appointments could not be loaded."));
  }, [tab, router.query.page, router.query.mode, router.query.status, router.query.date, router.query.range, token, userInfo?.role, headers]);
  const action = async (name) => {
    if (!selected) return;
    setBusy(true); setNotice(""); setNoticeError(false);
    dispatch(startLoading());
    try {
      const { data } = await axios.patch(`/api/booking/${selected._id}`, { action: name }, { headers });
      setSelected(data);
      setList((current) => ({ ...current, bookings: current.bookings.map((item) => item._id === data._id ? { ...item, ...data } : item) }));
      setNotice(`Appointment marked ${statusLabel(data.status)}.`);
    } catch (error) { setNoticeError(true); setNotice(error.response?.data?.error || "Appointment could not be updated."); }
    finally { setBusy(false); dispatch(finishLoading()); }
  };
  const save = async (kind) => {
    if (!overview?.doctor || busy) return;
    setBusy(true); setNotice(""); setNoticeError(false);
    dispatch(startLoading());
    try {
      const body = kind === "chambers"
        ? { doctor: { chambers: form.chambers } }
        : kind === "schedule"
          ? { doctor: { weeklyAvailability: form.weeklyAvailability, unavailablePeriods: form.unavailablePeriods, consultationModes: form.consultationModes, bookingSettings: form.bookingSettings } }
          : { user: { fullName: profile.fullName }, doctor: { speciality: profile.speciality, about: profile.about, consultationFee: Number(profile.consultationFee) } };
      const { data } = await axios.patch(`/api/doctors/${overview.doctor._id}`, body, { headers });
      setOverview((current) => ({ ...current, doctor: data.doctor }));
      const successMessage = kind === "chambers" ? "Your chambers have been saved." : kind === "schedule" ? "Your schedule has been saved." : "Doctor profile saved.";
      if (["chambers", "schedule"].includes(kind)) dispatch(showSnackBar({ message: successMessage, option: { variant: "success", anchorOrigin: { vertical: "bottom", horizontal: "center" }, autoHideDuration: 3500 } }));
      else setNotice(successMessage);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Changes could not be saved.";
      if (["chambers", "schedule"].includes(kind)) dispatch(showSnackBar({ message: errorMessage, option: { variant: "error", anchorOrigin: { vertical: "bottom", horizontal: "center" }, autoHideDuration: 4500 } }));
      else { setNoticeError(true); setNotice(errorMessage); }
    }
    finally { setBusy(false); dispatch(finishLoading()); }
  };
  if (!token || userInfo?.role !== "doctor") return <main className={styles.gate}><p>Sign in with your doctor account to open the dashboard.</p><Link href="/login">Sign in</Link></main>;
  const stats = overview?.stats || {};
  const doctor = overview?.doctor;
  const selectedMode = selected && modeOf(selected);
  const chamber = selectedMode === "chamber" && doctor?.chambers?.find((item) => String(item._id) === String(selected.chamberId));
  return <>
    <Head><title>Doctor dashboard | MediLocate</title><meta name="robots" content="noindex,nofollow" /></Head>
    <div className={styles.shell}><main className={styles.content}>
      <header className={styles.header}><div><small>MEDILOCATE DOCTOR</small><h1>{tab === "overview" ? "Overview" : tab === "video" ? "Video consultations" : tab.charAt(0).toUpperCase() + tab.slice(1)}</h1><p>Dr. {doctor?.user?.fullName || userInfo?.fullName || "Doctor"}</p></div></header>
      {notice && tab !== "chambers" && <p role={noticeError ? "alert" : "status"} className={`${styles.notice} ${noticeError ? styles.noticeError : ""}`}>{notice}</p>}
      {!overview && <p>Loading your dashboard…</p>}
      {tab === "overview" && overview && <>
        <section className={styles.stats}>{[
          ["Today", stats.today], ["Upcoming", stats.upcoming], ["Online today", stats.onlineToday],
          ["Chamber today", stats.chamberToday], ["Home today", stats.homeToday],
          ["Completed", stats.completed], ["Cancelled", stats.cancelled], ["Patients", stats.totalPatients],
          ["Earnings", `৳${Number(stats.earnings || 0).toLocaleString("en-BD")}`],
        ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}</section>
        <DoctorDashboardCharts charts={overview.charts} />
        <h2>Today's schedule</h2>
        <section className={styles.list}>{overview.today?.map((item) => <AppointmentCard key={item._id} booking={item} open={setSelected} />)}
          {!overview.today?.length && <p>No appointments scheduled today.</p>}</section>
      </>}
      {["appointments", "video", "earnings"].includes(tab) && overview && <>
        {tab === "earnings" && <div className={styles.earnings}><span>Total completed consultation earnings</span><strong>৳{Number(stats.earnings || 0).toLocaleString("en-BD")}</strong></div>}
        {tab === "appointments" && <section className={styles.filters}>
          <label>View<select value={router.query.range || ""} onChange={(event) => navigate({ range: event.target.value })}><option value="">All</option><option value="today">Today</option><option value="upcoming">Upcoming</option></select></label>
          <label>Type<select value={router.query.mode || "all"} onChange={(event) => navigate({ mode: event.target.value })}><option value="all">All</option><option value="online">Online</option><option value="chamber">Chamber</option><option value="home">Home</option></select></label>
          <label>Status<select value={router.query.status || "all"} onChange={(event) => navigate({ status: event.target.value })}>{["all", "pending", "confirmed", "waiting", "ongoing", "completed", "cancelled", "rejected", "no-show"].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
          <label>Date<input type="date" value={router.query.date || ""} onChange={(event) => navigate({ date: event.target.value })} /></label>
        </section>}
        <section className={styles.list}>{list.bookings?.map((item) => <AppointmentCard key={item._id} booking={item} open={setSelected} />)}
          {!list.bookings?.length && <p>No appointments match this view.</p>}</section>
        <Pagination totalPages={list.totalPages} currentPage={list.page} />
      </>}
      {tab === "patients" && overview && <section className={styles.list}>{overview.patients?.map((item) =>
        <article className={styles.appointment} key={item._id}><div><strong>{item.user?.fullName || "Patient"}</strong><span>{item.user?.phone || item.user?.phoneNumber || "—"}</span></div><span>{item.count} appointments</span><span>Last: {new Date(item.lastAppointment).toLocaleDateString("en-BD")}</span></article>)}
        {!overview.patients?.length && <p>No patients yet.</p>}</section>}
      {tab === "chambers" && overview && form && <section className={styles.sectionPanel}>
        <div className={styles.sectionHeader}>
          <div><small>CONSULTATION LOCATIONS</small><h2>Your chambers</h2><p>Add or edit the places where patients can book in-person appointments.</p></div>
          <button type="button" className={styles.secondaryLink} onClick={() => setForm((current) => ({ ...current, chambers: [...current.chambers, { name: "", address: "", city: "", phone: "", isActive: true }] }))}>Add chamber</button>
        </div>
        <div className={styles.chamberGrid}>{form.chambers.map((item, index) => <article className={styles.chamberCard} key={item._id || index}>
          <div className={styles.chamberCardHeader}><strong>{item.name || "New chamber"}</strong><button type="button" className={styles.removeChamber} aria-label="Remove chamber" onClick={() => setForm((current) => ({ ...current, chambers: current.chambers.filter((_, position) => position !== index) }))}>Remove</button></div>
          <div className={styles.chamberFields}>
            <label>Chamber name<input value={item.name || ""} onChange={(event) => setForm((current) => ({ ...current, chambers: current.chambers.map((chamber, position) => position === index ? { ...chamber, name: event.target.value } : chamber) }))} /></label>
            <label>Address<input value={item.address || ""} onChange={(event) => setForm((current) => ({ ...current, chambers: current.chambers.map((chamber, position) => position === index ? { ...chamber, address: event.target.value } : chamber) }))} /></label>
            <label>City<input value={item.city || ""} onChange={(event) => setForm((current) => ({ ...current, chambers: current.chambers.map((chamber, position) => position === index ? { ...chamber, city: event.target.value } : chamber) }))} /></label>
            <label>Phone<input value={item.phone || ""} onChange={(event) => setForm((current) => ({ ...current, chambers: current.chambers.map((chamber, position) => position === index ? { ...chamber, phone: event.target.value } : chamber) }))} /></label>
            <label className={styles.chamberToggle}><input type="checkbox" checked={item.isActive !== false} onChange={(event) => setForm((current) => ({ ...current, chambers: current.chambers.map((chamber, position) => position === index ? { ...chamber, isActive: event.target.checked } : chamber) }))} /> Active</label>
          </div>
        </article>)}
        {!form.chambers.length && <p className={styles.emptyState}>No chamber configured. Add a chamber to get started.</p>}</div>
        <div className={styles.sectionFooter}><button className={styles.primary} type="button" disabled={busy} onClick={() => save("chambers")}>Save chambers</button></div>
      </section>}
      {tab === "schedule" && overview && form && <><DoctorAvailabilityEditor value={form} onChange={setForm} /><button className={styles.primary} type="button" disabled={busy} onClick={() => save("schedule")}>Save schedule</button></>}
      {tab === "profile" && overview && <section className={styles.profile}>
        <label>Full name<input value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></label>
        <label>Speciality<input value={profile.speciality} onChange={(event) => setProfile({ ...profile, speciality: event.target.value })} /></label>
        <label>Consultation fee<input type="number" min="0" value={profile.consultationFee} onChange={(event) => setProfile({ ...profile, consultationFee: event.target.value })} /></label>
        <label>About<textarea value={profile.about} onChange={(event) => setProfile({ ...profile, about: event.target.value })} /></label>
        <button className={styles.primary} type="button" disabled={busy} onClick={() => save("profile")}>Save profile</button>
      </section>}
    </main></div>
    {selected && <div className={styles.overlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
      <aside className={styles.drawer} role="dialog" aria-label="Appointment details"><button type="button" onClick={() => setSelected(null)}>Close</button>
        <h2>Appointment</h2><p><strong>Patient:</strong> {selected.patientName || selected.patient?.fullName}</p>
        <p><strong>Phone:</strong> {selected.patientPhone || selected.patient?.phone || selected.patient?.phoneNumber || "—"}</p>
        <p><strong>Type:</strong> {LABELS[selectedMode]}</p><p><strong>Date and slot:</strong> {formatDate(selected)} · {selected.startTime}–{selected.endTime}</p>
        <p><strong>Status:</strong> {statusLabel(selected.status)} · <strong>Fee:</strong> ৳{selected.consultationFee}</p>
        {selectedMode === "chamber" && <p><strong>Chamber:</strong> {chamber ? `${chamber.name}, ${chamber.address}` : "Chamber details unavailable"} · Serial {selected.serial}</p>}
        {selectedMode === "home" && <p><strong>Visit address:</strong> {selected.homeVisitAddress?.address || "Not provided"}</p>}
        {(selected.symptoms || selected.patientNotes) && <p><strong>Patient notes:</strong> {selected.symptoms || selected.patientNotes}</p>}
        <div className={styles.actions}>
          {selected.paymentStatus === "paid" && ["pending", "rescheduled"].includes(selected.status) && <button disabled={busy} onClick={() => action("confirm")}>Confirm</button>}
          {selectedMode === "online" && ["confirmed", "rescheduled", "waiting", "ongoing"].includes(selected.status) && <Link href={`/consultation/${selected._id}`}>Join video</Link>}
          {["confirmed", "rescheduled", "waiting", "ongoing"].includes(selected.status) && <button disabled={busy} onClick={() => setConfirmAction("complete")}>Complete</button>}
          {!["completed", "cancelled", "rejected", "no-show"].includes(selected.status) && <>{["awaiting-payment", "payment-verification-pending", "pending"].includes(selected.status) && <button disabled={busy} onClick={() => action("reject")}>Reject</button>}{selected.status !== "ongoing" && <button disabled={busy} onClick={() => setConfirmAction("cancel")}>Cancel</button>}</>}
        </div>
      </aside>
    </div>}
    {confirmAction && <div className={styles.confirmOverlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setConfirmAction(null)}>
      <div className={styles.confirmDialog} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <span className={`${styles.confirmIcon} ${confirmAction === "cancel" ? styles.cancelIcon : ""}`}>{confirmAction === "cancel" ? "!" : "✓"}</span>
        <h2 id="confirm-title">{confirmAction === "cancel" ? "Cancel appointment?" : "Complete appointment?"}</h2>
        <p id="confirm-description">{confirmAction === "cancel" ? "Are you sure you want to cancel this appointment?" : "Confirm that this consultation has finished. The appointment will be marked as completed."}</p>
        <div className={styles.confirmActions}>
          <button type="button" className={styles.cancelConfirm} disabled={busy} onClick={() => setConfirmAction(null)}>Go back</button>
          <button type="button" className={confirmAction === "cancel" ? styles.dangerConfirm : styles.completeConfirm} disabled={busy} onClick={async () => { await action(confirmAction); setConfirmAction(null); }}>{confirmAction === "cancel" ? "Yes, cancel" : "Yes, complete"}</button>
        </div>
      </div>
    </div>}
  </>;
}
