import mongoose from "mongoose";

const otpChallengeSchema = new mongoose.Schema({
  phone: { type: String, required: true, trim: true, index: true },
  purpose: { type: String, enum: ["booking-login"], default: "booking-login" },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attemptsRemaining: { type: Number, min: 0, default: 5 },
  consumedAt: { type: Date, default: null },
  requestedIp: { type: String, trim: true, default: "" },
}, { timestamps: true });

otpChallengeSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

export default mongoose.models.OtpChallenge || mongoose.model("OtpChallenge", otpChallengeSchema);
