import mongoose from "mongoose";

export const BOOKING_STATUSES = [
  "awaiting-payment",
  "payment-verification-pending",
  "pending",
  "confirmed",
  "reschedule-requested",
  "rescheduled",
  "completed",
  "cancelled",
  "no-show",
];

export const BOOKING_PAYMENT_STATUSES = [
  "unpaid",
  "verification-pending",
  "paid",
  "rejected",
  "refund-pending",
  "refunded",
];

const statusEntrySchema = new mongoose.Schema({
  status: { type: String, enum: BOOKING_STATUSES, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  note: { type: String, trim: true, maxlength: 500, default: "" },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, maxlength: 80, default: "Home" },
  address: { type: String, trim: true, maxlength: 500, default: "" },
  city: { type: String, trim: true, maxlength: 100, default: "" },
  area: { type: String, trim: true, maxlength: 120, default: "" },
  landmark: { type: String, trim: true, maxlength: 200, default: "" },
  coordinates: { type: [Number], default: undefined },
}, { _id: false });

const rescheduleProposalSchema = new mongoose.Schema({
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestedAt: { type: Date, default: Date.now },
  reason: { type: String, trim: true, maxlength: 500, default: "" },
  appointmentDate: { type: Date, required: true },
  startTime: { type: String, trim: true, required: true },
  endTime: { type: String, trim: true, required: true },
  sessionStartTime: { type: String, trim: true, default: "" },
  sessionEndTime: { type: String, trim: true, default: "" },
  serial: { type: Number, min: 1, default: null },
  status: { type: String, enum: ["pending", "accepted", "declined", "withdrawn"], default: "pending" },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  respondedAt: { type: Date, default: null },
}, { _id: true });

const bookingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
  chamberId: { type: mongoose.Schema.Types.ObjectId, default: null },
  availabilitySlotId: { type: mongoose.Schema.Types.ObjectId, default: null },
  slotKey: { type: String, trim: true, default: undefined, index: { unique: true, sparse: true } },

  appointmentDate: { type: Date, required: true, index: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  sessionStartTime: { type: String, trim: true, default: "" },
  sessionEndTime: { type: String, trim: true, default: "" },
  timezone: { type: String, trim: true, default: "Asia/Dhaka" },
  serial: { type: Number, min: 1, default: null },
  consultationMode: { type: String, enum: ["chamber", "online", "home-visit"], required: true },

  consultationFee: { type: Number, required: true, min: 0 },
  platformFeePercent: { type: Number, min: 0, max: 100, default: 0 },
  platformFeeAmount: { type: Number, min: 0, default: 0 },
  doctorPayableAmount: { type: Number, min: 0, default: 0 },

  status: { type: String, enum: BOOKING_STATUSES, default: "awaiting-payment", index: true },
  statusTimeline: { type: [statusEntrySchema], default: () => [{ status: "awaiting-payment" }] },
  paymentStatus: { type: String, enum: BOOKING_PAYMENT_STATUSES, default: "unpaid", index: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "BookingPayment", default: null },
  paymentHoldExpiresAt: { type: Date, default: null, index: true },

  patientName: { type: String, trim: true, maxlength: 160, default: "" },
  patientPhone: { type: String, trim: true, maxlength: 30, default: "" },
  symptoms: { type: String, trim: true, maxlength: 1000, default: "" },
  patientNotes: { type: String, trim: true, maxlength: 1500, default: "" },
  doctorNotes: { type: String, trim: true, maxlength: 3000, default: "" },
  homeVisitAddress: { type: addressSchema, default: undefined },
  meetingLink: { type: String, trim: true, maxlength: 1000, default: "" },

  activeRescheduleRequest: { type: rescheduleProposalSchema, default: null },
  rescheduleHistory: { type: [rescheduleProposalSchema], default: [] },
  rescheduleCount: { type: Number, min: 0, default: 0 },
  cancellation: {
    reason: { type: String, trim: true, maxlength: 500, default: "" },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cancelledAt: { type: Date, default: null },
    refundRequired: { type: Boolean, default: false },
  },

  completedAt: { type: Date, default: null },
  payoutStatus: { type: String, enum: ["not-eligible", "pending", "paid", "held"], default: "not-eligible", index: true },
  payoutReference: { type: String, trim: true, default: "" },
}, {
  timestamps: true,
  optimisticConcurrency: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

bookingSchema.virtual("dateOfConsultation").get(function getLegacyConsultationDate() {
  return this.appointmentDate;
});

bookingSchema.index({ doctor: 1, appointmentDate: 1, consultationMode: 1, startTime: 1, status: 1 });
bookingSchema.index({ doctorProfile: 1, appointmentDate: 1, chamberId: 1, serial: 1 });
bookingSchema.index({ patient: 1, createdAt: -1 });

bookingSchema.pre("validate", function validateBooking(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new Error("Appointment end time must be after start time."));
  }
  if (this.consultationMode === "chamber" && !this.serial) {
    return next(new Error("A chamber booking requires a serial number."));
  }
  if (this.consultationMode === "home-visit" && !this.homeVisitAddress?.address) {
    return next(new Error("A home visit booking requires an address."));
  }
  return next();
});

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
