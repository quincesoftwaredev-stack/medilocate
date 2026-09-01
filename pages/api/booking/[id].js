import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";

const handler = nextConnect();
handler.use(isAuth);

const canAccess = (booking, user) => user.role === "admin"
  || String(booking.patient) === String(user._id)
  || String(booking.doctor) === String(user._id);

handler.get(async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) return res.status(400).json({ error: "Invalid booking ID." });
    await db.connect();
    const booking = await Booking.findById(req.query.id)
      .populate("patient", "fullName phone image")
      .populate("doctor", "fullName phone image speciality workingIn")
      .populate("payment");
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canAccess(booking, req.user)) return res.status(403).json({ error: "Not authorized." });
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Booking details error", error);
    return res.status(500).json({ error: "Failed to load booking." });
  }
});

handler.patch(async (req, res) => {
  try {
    const { id } = req.query;
    const action = req.body.action;
    if (!mongoose.Types.ObjectId.isValid(id) || !["confirm", "complete", "no-show", "cancel"].includes(action)) {
      return res.status(400).json({ error: "Invalid booking action." });
    }
    await db.connect();
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    if (!canAccess(booking, req.user)) return res.status(403).json({ error: "Not authorized." });
    const isDoctorOrAdmin = req.user.role === "admin" || String(booking.doctor) === String(req.user._id);
    if (["confirm", "complete", "no-show"].includes(action) && !isDoctorOrAdmin) return res.status(403).json({ error: "Only the doctor or admin can perform this action." });
    if (["completed", "cancelled", "no-show"].includes(booking.status)) return res.status(409).json({ error: "This booking is already final." });

    if (action === "confirm") {
      if (booking.paymentStatus !== "paid") return res.status(409).json({ error: "Payment must be verified first." });
      booking.status = "confirmed";
    } else if (action === "complete") {
      booking.status = "completed";
      booking.completedAt = new Date();
    } else if (action === "no-show") {
      booking.status = "no-show";
    } else {
      booking.status = "cancelled";
      booking.cancellation = {
        reason: String(req.body.reason || "Booking cancelled.").trim().slice(0, 500),
        cancelledBy: req.user._id,
        cancelledAt: new Date(),
        refundRequired: booking.paymentStatus === "paid",
      };
      if (booking.paymentStatus === "paid") booking.paymentStatus = "refund-pending";
    }
    booking.statusTimeline.push({ status: booking.status, changedBy: req.user._id, note: booking.cancellation?.reason || "" });
    await booking.save();
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Booking action error", error);
    return res.status(500).json({ error: "Failed to update booking." });
  }
});

export default handler;
