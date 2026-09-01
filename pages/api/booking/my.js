import nextConnect from "next-connect";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";

const handler = nextConnect();

handler.get(isAuth, async (req, res) => {
  try {
    await db.connect();
    const filter = req.user.role === "doctor" ? { doctor: req.user._id } : { patient: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const bookings = await Booking.find(filter)
      .populate("patient", "fullName phone image")
      .populate("doctor", "fullName phone speciality workingIn image")
      .populate("payment")
      .sort({ appointmentDate: 1, startTime: 1 });
    return res.status(200).json({ bookings });
  } catch (error) {
    console.error("My bookings error", error);
    return res.status(500).json({ error: "Failed to load bookings." });
  }
});

export default handler;
