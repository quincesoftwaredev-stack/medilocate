import nextConnect from "next-connect";
import { isAdmin, isAuth } from "@/utility";
import db from "@/database/connection";
import BookingPayment from "@/database/model/BookingPayment";

const handler = nextConnect();
handler.use(isAuth, isAdmin);

handler.get(async (req, res) => {
  try {
    await db.connect();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = 20;
    const filter = req.query.status ? { status: req.query.status } : {};
    const count = await BookingPayment.countDocuments(filter);
    const payments = await BookingPayment.find(filter)
      .populate({ path: "booking", select: "appointmentDate startTime endTime consultationMode status paymentStatus patientName" })
      .populate("patient", "fullName phone")
      .populate("doctor", "fullName phone")
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return res.status(200).json({ page, totalPages: Math.ceil(count / limit), count, payments });
  } catch (error) {
    console.error("Booking payment list error", error);
    return res.status(500).json({ error: "Failed to load booking payments." });
  }
});

export default handler;
