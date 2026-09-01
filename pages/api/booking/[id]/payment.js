import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import BookingPayment from "@/database/model/BookingPayment";

const handler = nextConnect();

handler.post(isAuth, async (req, res) => {
  try {
    const { id } = req.query;
    const transactionId = String(req.body.transactionId || "").trim().toUpperCase();
    const senderPhoneLast4 = String(req.body.senderPhoneLast4 || "").replace(/\D/g, "");
    if (!mongoose.Types.ObjectId.isValid(id) || !/^[A-Z0-9-]{6,40}$/.test(transactionId)) {
      return res.status(400).json({ error: "Enter a valid bKash transaction ID." });
    }
    if (senderPhoneLast4 && !/^\d{4}$/.test(senderPhoneLast4)) return res.status(400).json({ error: "Sender phone must contain the last four digits." });
    await db.connect();
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (String(booking.patient) !== String(req.user._id)) return res.status(403).json({ error: "Not authorized." });
    if (booking.payment || booking.paymentStatus === "paid") return res.status(409).json({ error: "Payment has already been submitted." });
    if (booking.status !== "awaiting-payment" || booking.paymentHoldExpiresAt <= new Date()) {
      return res.status(409).json({ error: "The payment hold expired. Please choose the slot again." });
    }
    const bookingReference = `ML-${String(booking._id).slice(-8).toUpperCase()}`;
    const payment = await BookingPayment.create({
      booking: booking._id,
      patient: booking.patient,
      doctor: booking.doctor,
      transactionId,
      bookingReference,
      amount: booking.consultationFee,
      senderPhoneLast4,
      screenshotUrl: String(req.body.screenshotUrl || "").trim(),
      platformFeePercent: booking.platformFeePercent,
      platformFeeAmount: booking.platformFeeAmount,
      doctorPayableAmount: booking.doctorPayableAmount,
    });
    booking.payment = payment._id;
    booking.paymentStatus = "verification-pending";
    booking.status = "payment-verification-pending";
    booking.paymentHoldExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    booking.statusTimeline.push({ status: booking.status, changedBy: req.user._id });
    await booking.save();
    return res.status(201).json({ booking, payment });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "This transaction ID has already been submitted." });
    console.error("Payment submission error", error);
    return res.status(500).json({ error: "Failed to submit payment for verification." });
  }
});

export default handler;
