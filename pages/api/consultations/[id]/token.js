import nextConnect from "next-connect";
import mongoose from "mongoose";
import { randomBytes } from "crypto";
import { AccessToken } from "livekit-server-sdk";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import { consultationConfig } from "@/config";
import { getConsultationTime, getConsultationEndTime } from "@/utility/booking";

const handler = nextConnect();
handler.use(isAuth);
const JOINABLE = ["confirmed", "rescheduled", "waiting", "ongoing"];

handler.get(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(400).json({ error: "Invalid appointment." });
    await db.connect();
    let booking = await Booking.findById(req.query.id);
    if (!booking) return res.status(404).json({ error: "Appointment not found." });
    const type = booking.consultationType || booking.consultationMode;
    const patient = String(booking.patient) === String(req.user._id) && req.user.role === "patient";
    const doctor = String(booking.doctor) === String(req.user._id) && req.user.role === "doctor";
    if (!patient && !doctor) return res.status(403).json({ error: "Not authorized for this consultation." });
    if (type !== "online") return res.status(409).json({ error: "Video is only available for online consultations." });
    if (!JOINABLE.includes(booking.status) || booking.paymentStatus !== "paid") return res.status(409).json({ error: "The consultation is not ready to join." });
    const scheduledAt = getConsultationTime(booking);
    const endsAt = getConsultationEndTime(booking);
    const now = Date.now();
    if (!scheduledAt || !endsAt || now < scheduledAt.getTime() - consultationConfig.joinBeforeMinutes.online * 60000 || now > endsAt.getTime() + 15 * 60000) {
      return res.status(409).json({ error: "Joining is only available near the appointment time." });
    }
    const { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) return res.status(503).json({ error: "Video consultation is not configured." });
    if (!booking.roomName) {
      const name = `consultation_${booking._id}_${randomBytes(12).toString("hex")}`;
      const updated = await Booking.findOneAndUpdate({ _id: booking._id, roomName: "" }, { $set: { roomName: name } }, { new: true });
      booking = updated || await Booking.findById(booking._id);
    }
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: `${patient ? "patient" : "doctor"}_${req.user._id}`,
      name: patient ? "Patient" : "Doctor",
      ttl: "1h",
    });
    token.addGrant({ roomJoin: true, room: booking.roomName, canPublish: true, canSubscribe: true, canPublishData: true });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ token: await token.toJwt(), serverUrl: LIVEKIT_URL });
  } catch (error) {
    console.error("Consultation token error", error);
    return res.status(500).json({ error: "Could not join the consultation." });
  }
});

export default handler;
