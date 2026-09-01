import crypto from "crypto";
import nextConnect from "next-connect";
import db from "@/database/connection";
import OtpChallenge from "@/database/model/OtpChallenge";
import Message from "@/services/message-service";
import { APP_SECRET } from "@/config";
import { normalizeBangladeshPhone } from "@/utility/booking";

const handler = nextConnect();
const hashCode = (challengeId, code) => crypto.createHash("sha256").update(`${challengeId}:${code}:${APP_SECRET}`).digest("hex");

handler.post(async (req, res) => {
  try {
    const phone = normalizeBangladeshPhone(req.body.phone);
    if (!phone) return res.status(400).json({ error: "Enter a valid Bangladesh mobile number." });
    await db.connect();

    const requestedIp = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await OtpChallenge.countDocuments({
      createdAt: { $gte: since },
      $or: [{ phone }, { requestedIp }],
    });
    if (recentCount >= 5) return res.status(429).json({ error: "Too many OTP requests. Please wait and try again." });

    const code = String(crypto.randomInt(100000, 1000000));
    const challenge = new OtpChallenge({
      phone,
      purpose: "booking-login",
      codeHash: "pending",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      requestedIp,
    });
    challenge.codeHash = hashCode(challenge._id, code);
    await challenge.save();

    const delivery = await new Message().sendMessage({
      number: phone,
      message: `Your MediLocate booking verification code is ${code}. It expires in 5 minutes. Never share this code.`,
    });
    if (delivery?.error) {
      await OtpChallenge.deleteOne({ _id: challenge._id });
      return res.status(503).json({ error: "OTP delivery is temporarily unavailable." });
    }
    return res.status(200).json({ challengeId: challenge._id, expiresInSeconds: 300 });
  } catch (error) {
    console.error("OTP request error", error);
    return res.status(500).json({ error: "Could not send OTP." });
  }
});

export default handler;
