import nextConnect from "next-connect";
import mongoose from "mongoose";
import { Receiver } from "@upstash/qstash";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import { sendConsultationReminders } from "@/services/consultation-reminder";

export const config = { api: { bodyParser: false } };

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
};

const handler = nextConnect();
handler.post(async (req, res) => {
  try {
    if (!process.env.QSTASH_CURRENT_SIGNING_KEY || !process.env.QSTASH_NEXT_SIGNING_KEY) {
      return res.status(500).json({ error: "QStash signing keys are not configured." });
    }
    const body = await readBody(req);
    const receiver = new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
    });
    const valid = await receiver.verify({
      signature: String(req.headers["upstash-signature"] || ""),
      body,
      url: "https://" + req.headers.host + req.url,
    });
    if (!valid) return res.status(401).json({ error: "Unauthorized." });
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(400).json({ error: "Invalid booking ID." });
    await db.connect();
    const booking = await Booking.findById(req.query.id).populate("doctor", "fullName phone phoneNumber").populate("patient", "fullName phone phoneNumber");
    if (!booking) return res.status(200).json({ skipped: true, reason: "booking-not-found" });
    const result = await sendConsultationReminders(booking);
    await Booking.updateOne({ _id: booking._id }, { $set: { qstashReminderMessageId: "", qstashReminderScheduledFor: null } });
    return res.status(200).json(result);
  } catch (error) {
    console.error("Scheduled consultation reminder failed", { reason: error.message });
    return res.status(500).json({ error: "Failed to send consultation reminder." });
  }
});
export default handler;
