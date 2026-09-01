import mongoose from "mongoose";

const doctorPayoutSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "BookingPayment" }],
  grossAmount: { type: Number, required: true, min: 0 },
  platformFeeAmount: { type: Number, required: true, min: 0 },
  netAmount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["bkash", "nagad", "bank"], required: true },
  destination: { type: String, trim: true, required: true },
  status: { type: String, enum: ["pending", "processing", "paid", "failed", "held"], default: "pending", index: true },
  reference: { type: String, trim: true, default: "" },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  processedAt: { type: Date, default: null },
  note: { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

export default mongoose.models.DoctorPayout || mongoose.model("DoctorPayout", doctorPayoutSchema);
