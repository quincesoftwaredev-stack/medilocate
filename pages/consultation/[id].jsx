import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import axios from "axios";
import { Track, VideoPresets, AudioPresets, ConnectionState } from "livekit-client";
import {
  LiveKitRoom, PreJoin, RoomAudioRenderer, VideoTrack, TrackToggle,
  MediaDeviceSelect, useTracks, useChat, useConnectionState,
  useConnectionQualityIndicator, useParticipants, useRoomContext,
} from "@livekit/components-react";
import styles from "@/styles/Doctor/Consultation.module.css";

const CALL_OPTIONS = {
  adaptiveStream: true,
  dynacast: true,
  publishDefaults: { videoEncoding: VideoPresets.h1080.encoding, audioPreset: AudioPresets.musicHighQuality, red: true },
};

const consultationStart = (booking) => booking.scheduledAt ? new Date(booking.scheduledAt)
  : new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(booking.appointmentDate))}T${booking.startTime}:00+06:00`);
const formatSchedule = (booking) => new Intl.DateTimeFormat("en-BD", {
  timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short",
}).format(consultationStart(booking));

function CallTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>;
}

function InCall({ booking, token, onLeave, onError }) {
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const remote = tracks.find((track) => !track.participant.isLocal);
  const local = tracks.find((track) => track.participant.isLocal);
  const participants = useParticipants();
  const remotePresent = participants.some((participant) => !participant.isLocal);
  const connection = useConnectionState();
  const { quality } = useConnectionQualityIndicator({ participant: room.localParticipant });
  const { chatMessages, send, isSending } = useChat();
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const seenMessages = useRef(0);
  const [draft, setDraft] = useState("");
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [speakerSupported, setSpeakerSupported] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const callRef = useRef(null);
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === callRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await callRef.current?.requestFullscreen?.();
    } catch { onError("Fullscreen is unavailable in this browser."); }
  };
  useEffect(() => setSpeakerSupported(typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype), []);
  useEffect(() => {
    const incoming = chatMessages.slice(seenMessages.current)
      .filter((message) => message.from?.identity !== room.localParticipant.identity).length;
    seenMessages.current = chatMessages.length;
    if (chatOpen) setUnread(0);
    else if (incoming) setUnread((count) => count + incoming);
  }, [chatMessages, chatOpen, room.localParticipant.identity]);
  const sendMessage = async (event) => {
    event.preventDefault();
    const message = draft.trim().slice(0, 500);
    if (!message || isSending) return;
    try { await send(message); setDraft(""); } catch { onError("Chat message could not be sent."); }
  };
  const leave = async () => {
    try { await axios.post(`/api/consultations/${booking._id}/presence`, { action: "leave" }, { headers: { Authorization: `Bearer ${token}` } }); } catch {}
    await room.disconnect();
    onLeave();
  };
  const weak = quality === "poor" || quality === "lost";
  return <div ref={callRef} className={styles.call}>
    <div className={styles.callHeader}><strong>{booking.doctor?.fullName || "Doctor"} · {booking.patientName || "Patient"}</strong>
      <div><span className={styles.quality}>{connection === ConnectionState.Reconnecting ? "Reconnecting" : quality === "excellent" ? "Excellent" : quality === "good" ? "Good" : weak ? "Poor" : "Connecting"}</span><CallTimer /></div>
    </div>
    {connection === ConnectionState.Reconnecting && <p className={styles.banner}>Reconnecting to consultation…</p>}
    {weak && <p className={styles.banner}>Network is weak. Video may reduce quality to keep audio clear.</p>}
    <div className={styles.callBody}>
      <div className={styles.videoArea}>
        <div className={styles.remote}>{remote ? <VideoTrack trackRef={remote} /> : <p>{remotePresent ? "The other camera is off." : (booking.doctor?.fullName ? "Waiting for the other participant to join…" : "Waiting…")}</p>}</div>
        <div className={styles.local}>{local ? <VideoTrack trackRef={local} /> : <span>Your camera is off</span>}</div>
      </div>
      <aside className={`${styles.chat} ${chatOpen ? styles.chatOpen : ""}`} aria-hidden={!chatOpen}>
        <div className={styles.chatHeader}><strong>Private chat</strong><button type="button" onClick={() => setChatOpen(false)}>Back to video</button></div>
        <small>Messages are available only during this call and are not saved.</small>
        <div className={styles.messages}>{chatMessages.map((item, index) =>
          <div key={`${item.timestamp}-${index}`} className={item.from?.identity === room.localParticipant.identity ? styles.ownMessage : ""}>
            <strong>{item.from?.identity === room.localParticipant.identity ? "You" : item.from?.name || "Participant"}</strong>
            <p>{item.message}</p><time>{new Date(item.timestamp).toLocaleTimeString("en-BD", { hour: "numeric", minute: "2-digit" })}</time>
          </div>)}</div>
        <form onSubmit={sendMessage}><input maxLength="500" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a private message" aria-label="Private chat message" /><button type="submit" disabled={!draft.trim() || isSending}>Send</button></form>
      </aside>
    </div>
    {devicesOpen && <div className={styles.devices}><label>Microphone<MediaDeviceSelect kind="audioinput" /></label><label>Camera<MediaDeviceSelect kind="videoinput" /></label>{speakerSupported && <label>Speaker<MediaDeviceSelect kind="audiooutput" /></label>}</div>}
    <div className={styles.controls}>
      <TrackToggle source={Track.Source.Microphone}>Mic</TrackToggle>
      <TrackToggle source={Track.Source.Camera}>Camera</TrackToggle>
      <button type="button" onClick={() => setDevicesOpen((value) => !value)}>Devices</button>
      <button type="button" onClick={() => setChatOpen((value) => !value)}>Chat {unread > 0 && <span className={styles.unread}>{unread}</span>}</button>
      <button type="button" onClick={toggleFullscreen}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button>
      <button type="button" className={styles.end} onClick={() => setConfirmEnd(true)}>End</button>
    </div>
    {confirmEnd && <div className={styles.confirmOverlay} role="presentation">
      <div className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="end-call-title">
        <h2 id="end-call-title">End consultation?</h2>
        <p>Are you sure you want to leave this video call?</p>
        <div><button type="button" onClick={() => setConfirmEnd(false)}>Keep calling</button>
          <button type="button" className={styles.end} onClick={leave}>End consultation</button></div>
      </div>
    </div>}
  </div>;
}

export default function ConsultationPage() {
  const router = useRouter();
  const storedUserInfo = useSelector((state) => state.user?.userInfo);
  const [hydrated, setHydrated] = useState(false);
  const userInfo = hydrated ? storedUserInfo : null;
  const [booking, setBooking] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(0);
  const [permissions, setPermissions] = useState({ microphone: "Check in preview", camera: "Check in preview" });
  useEffect(() => {
    setHydrated(true);
    setNow(Date.now());
  }, []);
  useEffect(() => {
    if (!navigator.permissions?.query) return;
    for (const [name, key] of [["microphone", "microphone"], ["camera", "camera"]]) {
      navigator.permissions.query({ name }).then((status) => {
        setPermissions((current) => ({ ...current, [key]: status.state === "granted" ? "Ready" : status.state === "denied" ? "Blocked" : "Check in preview" }));
      }).catch(() => {});
    }
  }, []);
  const authToken = userInfo?.token;
  useEffect(() => {
    if (!router.isReady || !authToken) return;
    axios.get(`/api/booking/${router.query.id}`, { headers: { Authorization: `Bearer ${authToken}` } })
      .then(({ data }) => setBooking(data))
      .catch((requestError) => setError(requestError.response?.data?.error || "Appointment could not be loaded."));
  }, [router.isReady, router.query.id, authToken]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const joinWindow = useMemo(() => {
    if (!booking) return { joinable: false, reason: "" };
    if ((booking.consultationType || booking.consultationMode) !== "online") return { joinable: false, reason: "Video is only available for online consultations." };
    if (!["confirmed", "rescheduled", "waiting", "ongoing"].includes(booking.status)) return { joinable: false, reason: `This appointment is ${booking.status}; it must be confirmed before joining.` };
    if (booking.paymentStatus !== "paid") return { joinable: false, reason: "Payment must be verified before joining." };
    const startsAt = consultationStart(booking);
    const opensAt = new Date(startsAt.getTime() - Number(booking.joinBeforeMinutes || 10) * 60000);
    const endsAt = booking.slotEnd ? new Date(booking.slotEnd) : new Date(`${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(startsAt)}T${booking.endTime}:00+06:00`);
    if (now < opensAt.getTime()) return { joinable: false, reason: `Join opens ${new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(opensAt)}.` };
    if (now > endsAt.getTime() + 15 * 60000) return { joinable: false, reason: "This appointment's joining window has ended." };
    return { joinable: true, reason: "" };
  }, [booking, now]);
  const joinable = joinWindow.joinable;
  const join = async (choices) => {
    if (!joinable || loading) return;
    setLoading(true); setError("");
    try {
      const { data } = await axios.get(`/api/consultations/${booking._id}/token`, { headers: { Authorization: `Bearer ${authToken}` } });
      setCall({ ...data, choices });
    } catch (requestError) { setError(requestError.response?.data?.error || "Could not join consultation."); }
    finally { setLoading(false); }
  };
  return <>
    <Head><title>Online consultation | MediLocate</title><meta name="robots" content="noindex,nofollow" /></Head>
    <main className={styles.page}>
      {hydrated && !authToken && <p>Sign in as the booked doctor or patient to view this consultation.</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {!booking && authToken && !error && <p>Loading appointment…</p>}
      {booking && (booking.consultationType || booking.consultationMode) !== "online" && <p>This appointment is not an online consultation.</p>}
      {booking && (booking.consultationType || booking.consultationMode) === "online" && !call && <section className={styles.prejoin}>
        <h1>Online consultation</h1>
        <p>Dr. {booking.doctor?.fullName || "Doctor"} · {booking.patientName || booking.patient?.fullName || "Patient"}</p>
        <p>{formatSchedule(booking)} · {booking.status}</p>
        <p>Microphone: {permissions.microphone} · Camera: {permissions.camera} · Speaker: Ready on supported browsers. Check the live preview before joining.</p>
        {!joinable && <p className={styles.notice}>{joinWindow.reason}</p>}
        <PreJoin defaults={{ username: "Consultation participant" }} onSubmit={join} onValidate={() => Boolean(joinable) && !loading}
          onError={(mediaError) => setError(mediaError.message)} joinLabel={loading ? "Connecting…" : "Join consultation"}
          persistUserChoices={false} />
      </section>}
      {booking && call && <LiveKitRoom token={call.token} serverUrl={call.serverUrl} connect
        audio={call.choices.audioEnabled ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true, deviceId: call.choices.audioDeviceId || undefined } : false}
        video={call.choices.videoEnabled ? { resolution: VideoPresets.h1080.resolution, deviceId: call.choices.videoDeviceId || undefined, facingMode: "user" } : false}
        options={CALL_OPTIONS}
        onConnected={() => axios.post(`/api/consultations/${booking._id}/presence`, { action: "join" }, { headers: { Authorization: `Bearer ${authToken}` } }).catch(() => setError("Call status could not be updated."))}
        onDisconnected={() => setCall(null)}
        onError={(callError) => setError(callError.message)}
        onMediaDeviceFailure={() => setError("Microphone or camera is unavailable. Check browser permissions and devices.")}>
        <RoomAudioRenderer />
        <InCall booking={booking} token={authToken} onLeave={() => setCall(null)} onError={setError} />
      </LiveKitRoom>}
    </main>
  </>;
}
