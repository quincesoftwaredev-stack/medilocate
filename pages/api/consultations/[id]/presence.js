import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import { getConsultationTime, getConsultationEndTime } from "@/utility/booking";
import { consultationConfig } from "@/config";

const handler = nextConnect();
handler.use(isAuth);

handler.post(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.id) || !["join", "leave"].includes(req.body.action)) return res.status(400).json({ error: "Invalid call action." });
    await db.connect();
    const booking = await Booking.findById(req.query.id);
    if (!booking) return res.status(404).json({ error: "Appointment not found." });
    const role = String(booking.patient) === String(req.user._id) && req.user.role === "patient" ? "patient"
      : String(booking.doctor) === String(req.user._id) && req.user.role === "doctor" ? "doctor" : null;
    if (!role) return res.status(403).json({ error: "Not authorized." });
    if ((booking.consultationType || booking.consultationMode) !== "online" || !["confirmed", "rescheduled", "waiting", "ongoing"].includes(booking.status)) return res.status(409).json({ error: "Consultation is not active." });
    if (req.body.action === "join") {
      const startsAt = getConsultationTime(booking);
      const endsAt = getConsultationEndTime(booking);
      if (!startsAt || !endsAt || Date.now() < startsAt.getTime() - consultationConfig.joinBeforeMinutes.online * 60000 || Date.now() > endsAt.getTime() + 15 * 60000) return res.status(409).json({ error: "It is too early to join." });
      const joinedKey = `${role}JoinedAt`;
      const leftKey = `${role}LeftAt`;
      await Booking.updateOne({ _id: booking._id }, { $set: { [leftKey]: null, endedAt: null } });
      await Booking.updateOne({ _id: booking._id, [joinedKey]: null }, { $set: { [joinedKey]: new Date() } });
      const fresh = await Booking.findById(booking._id);
      if (fresh.patientJoinedAt && fresh.doctorJoinedAt && !fresh.patientLeftAt && !fresh.doctorLeftAt) {
        await Booking.updateOne({ _id: booking._id, status: { $in: ["confirmed", "rescheduled", "waiting"] } }, {
          $set: { status: "ongoing", startedAt: fresh.startedAt || new Date() },
          $push: { statusTimeline: { status: "ongoing", changedBy: req.user._id } },
        });
      } else {
        await Booking.updateOne({ _id: booking._id, status: { $in: ["confirmed", "rescheduled"] } }, {
          $set: { status: "waiting" }, $push: { statusTimeline: { status: "waiting", changedBy: req.user._id } },
        });
      }
    } else {
      await Booking.updateOne({ _id: booking._id }, { $set: { endedAt: new Date(), [`${role}LeftAt`]: new Date() } });
      await Booking.updateOne({ _id: booking._id, status: "ongoing" }, { $set: { status: "waiting" }, $push: { statusTimeline: { status: "waiting", changedBy: req.user._id } } });
    }
    return res.status(200).json({ status: (await Booking.findById(booking._id)).status });
  } catch (error) {
    console.error("Consultation presence error", error);
    return res.status(500).json({ error: "Could not update call state." });
  }
});

export default handler;
