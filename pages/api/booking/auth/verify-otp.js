import crypto from "crypto";
import mongoose from "mongoose";
import nextConnect from "next-connect";
import db from "@/database/connection";
import OtpChallenge from "@/database/model/OtpChallenge";
import User from "@/database/model/User";
import { APP_SECRET } from "@/config";
import { GenerateSignature } from "@/utility";

const handler = nextConnect();
const hashCode = (challengeId, code) => crypto.createHash("sha256").update(`${challengeId}:${code}:${APP_SECRET}`).digest("hex");

handler.post(async (req, res) => {
  try {
    const { challengeId, code, fullName = "" } = req.body;
    if (!mongoose.Types.ObjectId.isValid(challengeId) || !/^\d{6}$/.test(String(code || ""))) {
      return res.status(400).json({ error: "Enter the six-digit verification code." });
    }
    await db.connect();
    const challenge = await OtpChallenge.findById(challengeId);
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) return res.status(400).json({ error: "This verification code has expired." });
    if (challenge.attemptsRemaining <= 0) return res.status(429).json({ error: "Too many incorrect attempts. Request a new code." });

    const candidate = hashCode(challenge._id, String(code));
    const matches = crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(challenge.codeHash));
    if (!matches) {
      challenge.attemptsRemaining -= 1;
      await challenge.save();
      return res.status(400).json({ error: "Incorrect verification code." });
    }

    challenge.consumedAt = new Date();
    await challenge.save();
    const localPhone = challenge.phone.slice(2);
    let user = await User.findOne({ $or: [{ phone: localPhone }, { phone: challenge.phone }, { phone: `+${challenge.phone}` }] });
    if (!user) {
      user = await User.create({
        phone: localPhone,
        fullName: String(fullName || "MediLocate Patient").trim().slice(0, 160),
        role: "patient",
        isVerified: true,
        uid: `PT${Date.now().toString(36).toUpperCase()}${crypto.randomInt(100, 1000)}`,
      });
    } else if (user.role !== "patient") {
      return res.status(409).json({ error: "This mobile number belongs to a staff account. Use a patient mobile number." });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = await GenerateSignature({ _id: user._id, email: user.email, role: user.role, isVerified: true });
    return res.status(200).json({ id: user._id, token, role: user.role, phone: user.phone, fullName: user.fullName, isVerified: true });
  } catch (error) {
    console.error("OTP verification error", error);
    return res.status(500).json({ error: "Could not verify OTP." });
  }
});

export default handler;
