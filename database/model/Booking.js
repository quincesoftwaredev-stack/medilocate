import mongoose from "mongoose";

const bookingStatusValues = ["pending", "confirmed", "completed", "cancelled", "no-show", "rescheduled"];

const statusEntrySchema = new mongoose.Schema({
  status: { type: String, enum: bookingStatusValues, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  note: { type: String, trim: true, default: "" },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", default: null, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  chamberId: { type: mongoose.Schema.Types.ObjectId, default: null },
  appointmentDate: { type: Date, required: true, index: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  timezone: { type: String, trim: true, default: "Asia/Dhaka" },
  serial: { type: Number, required: true },
  consultationMode: { type: String, enum: ["chamber", "online", "home-visit"], default: "chamber" },
  consultationFee: { type: Number, required: true, min: 0 },
  followUpFee: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: bookingStatusValues, default: "pending", index: true },
  statusTimeline: { type: [statusEntrySchema], default: () => [{ status: "pending" }] },
  symptoms: { type: String, trim: true, default: "" },
  patientNotes: { type: String, trim: true, default: "" },
  doctorNotes: { type: String, trim: true, default: "" },
  cancellation: {
    reason: { type: String, trim: true, default: "" },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cancelledAt: { type: Date, default: null },
  },
  rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
  meetingLink: { type: String, trim: true, default: "" },
}, { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

bookingSchema.virtual("dateOfConsultation").get(function getLegacyConsultationDate() {
  return this.appointmentDate;
});

bookingSchema.index({ doctor: 1, appointmentDate: 1, startTime: 1, status: 1 });
bookingSchema.index({ patient: 1, createdAt: -1 });

bookingSchema.pre("validate", function validateTimeRange(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new Error("Appointment end time must be after start time."));
  }
  return next();
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
