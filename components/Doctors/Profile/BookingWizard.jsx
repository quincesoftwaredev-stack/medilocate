import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import styles from "./BookingWizard.module.css";
import { login } from "@/redux/userSlice";

const modeLabels = { chamber: "Chamber", online: "Online", "home-visit": "Home visit" };
const modeKey = { chamber: "chamber", online: "online", "home-visit": "homeVisit" };
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const formatTime = (value = "") => {
  const [hourValue, minuteValue = "00"] = String(value).split(":");
  const hour = Number(hourValue);
  if (!Number.isFinite(hour)) return value;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteValue} ${period}`;
};

export default function BookingWizard({ doctor }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user?.userInfo);
  const scheduledModes = useMemo(() => new Set(
      (doctor.weeklyAvailability || [])
        .filter((day) => day.isAvailable !== false)
        .flatMap((day) => (day.slots || []).map((slot) => slot.consultationMode || "chamber"))
    ), [doctor.weeklyAvailability]);
  const modes = useMemo(() => Object.keys(modeLabels).filter((item) => scheduledModes.has(item)), [scheduledModes]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(modes[0] || "");
  const [date, setDate] = useState(today());
  const [availability, setAvailability] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasPatientSession = userInfo?.role === "patient" && Boolean(userInfo?.token);
  const [patient, setPatient] = useState({ fullName: hasPatientSession ? userInfo?.fullName || "" : "", phone: hasPatientSession ? userInfo?.phone || "" : "", symptoms: "", address: "" });
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState(hasPatientSession ? userInfo.token : "");
  const [booking, setBooking] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [payment, setPayment] = useState({ transactionId: "", senderPhoneLast4: "" });

  useEffect(() => {
    if (router.isReady && router.query.book === "1") setOpen(true);
  }, [router.isReady, router.query.book]);

  useEffect(() => { setToken(userInfo?.role === "patient" ? userInfo?.token || "" : ""); }, [userInfo]);
  useEffect(() => {
    if (!open || !mode || !date) return;
    let active = true;
    setLoading(true); setError(""); setSelected(null);
    axios.get("/api/booking/availability", { params: { doctorProfileId: doctor.id, date, mode } })
      .then(({ data }) => active && setAvailability(data))
      .catch((requestError) => active && setError(requestError.response?.data?.error || "Availability could not be loaded."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [date, doctor.id, mode, open]);

  const chooseWindow = (window, subSlot = null) => setSelected({ window, subSlot });
  const selectionLabel = selected
    ? mode === "chamber"
      ? `${formatTime(selected.window.startTime)}–${formatTime(selected.window.endTime)} · Serial ${selected.window.nextSerial} · Estimated ${formatTime(selected.window.estimatedStartTime)}`
      : selected.subSlot
        ? `${formatTime(selected.subSlot.startTime)}–${formatTime(selected.subSlot.endTime)}`
        : ""
    : "";

  const changeMode = (nextMode) => {
    if (!scheduledModes.has(nextMode) || nextMode === mode) return;
    setSelected(null);
    setAvailability(null);
    setError("");
    setMode(nextMode);
  };

  const requestOtp = async () => {
    if (!patient.fullName.trim()) return setError("Enter the patient name.");
    if (mode === "home-visit" && !patient.address.trim()) return setError("Enter the home visit address.");
    setLoading(true); setError("");
    try {
      const { data } = await axios.post("/api/booking/auth/request-otp", { phone: patient.phone });
      setChallengeId(data.challengeId); setStep(3);
    } catch (requestError) { setError(requestError.response?.data?.error || "OTP could not be sent."); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.post("/api/booking/auth/verify-otp", { challengeId, code: otp, fullName: patient.fullName });
      dispatch(login(data)); setToken(data.token); setStep(4);
    } catch (requestError) { setError(requestError.response?.data?.error || "OTP verification failed."); }
    finally { setLoading(false); }
  };

  const continueFromDetails = () => {
    if (!patient.fullName.trim()) return setError("Enter the patient name.");
    if (mode === "home-visit" && !patient.address.trim()) return setError("Enter the home visit address.");
    setError(""); setStep(token ? 4 : 2);
  };

  const createBooking = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.post("/api/booking", {
        doctorProfileId: doctor.id, date, consultationMode: mode,
        availabilitySlotId: selected.window.slotId,
        startTime: selected.subSlot?.startTime,
        patientName: patient.fullName, symptoms: patient.symptoms,
        homeVisitAddress: mode === "home-visit" ? { address: patient.address } : undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBooking(data);
      const response = await axios.get("/api/booking/payment-instructions");
      setInstructions(response.data); setStep(5);
    } catch (requestError) { setError(requestError.response?.data?.error || "Booking could not be created."); }
    finally { setLoading(false); }
  };

  const submitPayment = async () => {
    setLoading(true); setError("");
    try {
      await axios.post(`/api/booking/${booking._id}/payment`, payment, { headers: { Authorization: `Bearer ${token}` } });
      setStep(6);
    } catch (requestError) { setError(requestError.response?.data?.error || "Payment could not be submitted."); }
    finally { setLoading(false); }
  };

  if (!modes.length) return null;
  return (
    <>
      <button type="button" className={styles.launch} onClick={() => setOpen(true)}><CalendarMonthOutlinedIcon /> Book consultation</button>
      {open && <div className={styles.backdrop} role="presentation">
        <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Book consultation">
          <header><div><small>MEDILOCATE APPOINTMENTS</small><h2>{step === 6 ? "Booking submitted" : "Book consultation"}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><CloseOutlinedIcon /></button></header>
          {step < 6 && <div className={styles.progress}><span style={{ width: `${Math.min(step, 5) * 20}%` }} /></div>}
          {error && <p className={styles.error}>{error}</p>}

          {step === 1 && <div className={styles.body}>
            <div className={styles.modeGrid}>{Object.keys(modeLabels).map((item) => {
              const available = scheduledModes.has(item);
              return <button type="button" key={item} disabled={!available} className={`${mode === item ? styles.active : ""} ${!available ? styles.unavailable : ""}`} onClick={() => changeMode(item)}><strong>{modeLabels[item]}</strong><small>{available ? (doctor.consultationModes?.[modeKey[item]]?.fee != null ? `৳${doctor.consultationModes[modeKey[item]].fee}` : doctor.fee) : "Not available"}</small></button>;
            })}</div>
            <label>Date<input type="date" min={today()} value={date} onChange={(event) => setDate(event.target.value)} /></label>
            {loading ? <p className={styles.muted}>Loading available times…</p> : <div className={styles.windows}>
              {availability?.windows?.map((window) => mode === "chamber"
                ? <button type="button" key={window.slotId} disabled={!window.remaining} className={selected?.window.slotId === window.slotId ? styles.selected : ""} onClick={() => chooseWindow(window)}>{formatTime(window.startTime)}–{formatTime(window.endTime)}<small>{window.remaining ? `Serial ${window.nextSerial} · arrive around ${formatTime(window.estimatedStartTime)}` : "Full"}</small></button>
                : window.subSlots?.filter((slot) => slot.available).map((slot) => <button type="button" key={`${window.slotId}-${slot.startTime}`} className={selected?.window.slotId === window.slotId && selected?.subSlot?.startTime === slot.startTime ? styles.selected : ""} onClick={() => chooseWindow(window, slot)}>{formatTime(slot.startTime)}–{formatTime(slot.endTime)}</button>))}
              {!availability?.windows?.length && <p className={styles.muted}>No availability on this date.</p>}
            </div>}
            <div className={styles.actions}><button type="button" className={styles.primary} disabled={!selected} onClick={() => setStep(2)}>Continue</button></div>
          </div>}

          {step === 2 && <div className={styles.body}><div className={styles.summary}><strong>{modeLabels[mode]} · {date}</strong><span>{selectionLabel}</span></div>
            <div className={styles.fields}><label>Patient name<input value={patient.fullName} onChange={(e) => setPatient({ ...patient, fullName: e.target.value })} /></label><label>Mobile number<input inputMode="tel" disabled={Boolean(token)} value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} placeholder="01XXXXXXXXX" /></label><label>Symptoms or reason<textarea rows="3" value={patient.symptoms} onChange={(e) => setPatient({ ...patient, symptoms: e.target.value })} /></label>{mode === "home-visit" && <label>Visit address<textarea rows="3" value={patient.address} onChange={(e) => setPatient({ ...patient, address: e.target.value })} /></label>}</div>
            <div className={styles.actions}><button type="button" onClick={() => setStep(1)}>Back</button><button type="button" className={styles.primary} disabled={loading} onClick={token ? continueFromDetails : requestOtp}>{token ? "Review booking" : "Send OTP"}</button></div>
          </div>}

          {step === 3 && <div className={styles.body}><p className={styles.muted}>Enter the six-digit code sent to {patient.phone}.</p><label>Verification code<input inputMode="numeric" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} /></label><div className={styles.actions}><button type="button" onClick={() => setStep(2)}>Back</button><button type="button" className={styles.primary} disabled={otp.length !== 6 || loading} onClick={verifyOtp}>Verify & continue</button></div></div>}

          {step === 4 && <div className={styles.body}><div className={styles.review}><div><span>Doctor</span><strong>{doctor.name}</strong></div><div><span>Mode</span><strong>{modeLabels[mode]}</strong></div><div><span>Date & time</span><strong>{date} · {selectionLabel}</strong></div><div><span>Fee</span><strong>৳{availability?.fee || 0}</strong></div></div><p className={styles.muted}>The selected slot will be held for 15 minutes while you complete payment.</p><div className={styles.actions}><button type="button" onClick={() => setStep(2)}>Back</button><button type="button" className={styles.primary} disabled={loading} onClick={createBooking}>Confirm & pay</button></div></div>}

          {step === 5 && <div className={styles.body}><div className={styles.payment}><span>Send the exact amount</span><strong>৳{booking.consultationFee}</strong><p>{instructions?.provider}: {instructions?.merchantNumber}</p>{instructions?.qrCodeUrl && <img src={instructions.qrCodeUrl} alt="bKash payment QR" />}</div><div className={styles.fields}><label>Transaction ID<input value={payment.transactionId} onChange={(e) => setPayment({ ...payment, transactionId: e.target.value.toUpperCase() })} /></label><label>Sender number’s last 4 digits (optional)<input inputMode="numeric" maxLength="4" value={payment.senderPhoneLast4} onChange={(e) => setPayment({ ...payment, senderPhoneLast4: e.target.value.replace(/\D/g, "") })} /></label></div><div className={styles.actions}><button type="button" className={styles.primary} disabled={payment.transactionId.length < 6 || loading} onClick={submitPayment}>Submit for verification</button></div></div>}

          {step === 6 && <div className={styles.success}><strong>Payment verification pending</strong><p>Your slot is reserved. MediLocate will verify the transaction and update the booking status.</p><button type="button" className={styles.primary} onClick={() => setOpen(false)}>Done</button></div>}
        </section>
      </div>}
    </>
  );
}
