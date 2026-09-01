import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAdmin, isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import BookingPayment from "@/database/model/BookingPayment";

const handler = nextConnect();
handler.use(isAuth, isAdmin);

handler.patch(async (req, res) => {
  try {
    const { id } = req.query;
    const action = req.body.action;
    if (!mongoose.Types.ObjectId.isValid(id) || !["verify", "reject"].includes(action)) return res.status(400).json({ error: "Invalid verification request." });
    await db.connect();
    const payment = await BookingPayment.findById(id);
    if (!payment || payment.status !== "verification-pending") return res.status(404).json({ error: "Pending payment not found." });
    const booking = await Booking.findById(payment.booking);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (action === "verify") {
      payment.status = "verified";
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      payment.payoutStatus = "pending";
      booking.paymentStatus = "paid";
      booking.status = "pending";
      booking.paymentHoldExpiresAt = null;
      booking.payoutStatus = "pending";
    } else {
      payment.status = "rejected";
      payment.rejectionReason = String(req.body.reason || "Payment could not be verified.").trim().slice(0, 500);
      booking.paymentStatus = "rejected";
      booking.status = "cancelled";
      booking.paymentHoldExpiresAt = null;
      booking.cancellation = { reason: payment.rejectionReason, cancelledBy: req.user._id, cancelledAt: new Date(), refundRequired: false };
    }
    booking.statusTimeline.push({ status: booking.status, changedBy: req.user._id, note: payment.rejectionReason || "Payment verified by admin." });
    await payment.save();
    await booking.save();
    return res.status(200).json({ booking, payment });
  } catch (error) {
    console.error("Payment verification error", error);
    return res.status(500).json({ error: "Failed to update payment verification." });
  }
});

export default handler;
