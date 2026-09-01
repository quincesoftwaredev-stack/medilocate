import mongoose from "mongoose";

const bookingPaymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  provider: { type: String, enum: ["bkash"], default: "bkash" },
  transactionId: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
  bookingReference: { type: String, required: true, trim: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["BDT"], default: "BDT" },
  senderPhoneLast4: { type: String, trim: true, match: /^\d{4}$/, default: "" },
  screenshotUrl: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["verification-pending", "verified", "rejected", "refund-pending", "refunded"], default: "verification-pending", index: true },
  submittedAt: { type: Date, default: Date.now },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  verifiedAt: { type: Date, default: null },
  rejectionReason: { type: String, trim: true, maxlength: 500, default: "" },
  platformFeePercent: { type: Number, min: 0, max: 100, default: 0 },
  platformFeeAmount: { type: Number, min: 0, default: 0 },
  doctorPayableAmount: { type: Number, min: 0, default: 0 },
  payoutStatus: { type: String, enum: ["not-eligible", "pending", "paid", "held"], default: "not-eligible", index: true },
  payoutReference: { type: String, trim: true, default: "" },
  refundedAt: { type: Date, default: null },
  refundReference: { type: String, trim: true, default: "" },
}, { timestamps: true, optimisticConcurrency: true });

export default mongoose.models.BookingPayment || mongoose.model("BookingPayment", bookingPaymentSchema);
