import nextConnect from "next-connect";
import mongoose from "mongoose";
import { isAuth } from "@/utility";
import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import Doctor from "@/database/model/Doctor";
import User from "@/database/model/User";
import { getDhakaDateKey } from "@/utility/booking";

const handler = nextConnect();
handler.use(isAuth);

handler.get(async (req, res) => {
  if (req.user.role !== "doctor") return res.status(403).json({ error: "Doctor access required." });
  try {
    await db.connect();
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "fullName image phone phoneNumber").lean();
    if (!doctor) return res.status(404).json({ error: "Doctor profile not found." });
    const day = getDhakaDateKey(new Date());
    const todayStart = new Date(`${day}T00:00:00+06:00`);
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const own = { doctor: new mongoose.Types.ObjectId(req.user._id) };
    const trendStart = new Date(todayStart.getTime() - 29 * 86400000);
    const [today, upcoming, completed, cancelled, patients, earnings, uniquePatients, trendRows, typeRows] = await Promise.all([
      Booking.find({ ...own, appointmentDate: { $gte: todayStart, $lt: todayEnd }, status: { $nin: ["cancelled", "rejected"] } })
        .populate("patient", "fullName phone phoneNumber").sort({ startTime: 1 }).lean(),
      Booking.countDocuments({ ...own, appointmentDate: { $gte: todayStart }, status: { $nin: ["completed", "cancelled", "rejected", "no-show"] } }),
      Booking.countDocuments({ ...own, status: "completed" }),
      Booking.countDocuments({ ...own, status: { $in: ["cancelled", "rejected"] } }),
      Booking.aggregate([{ $match: own }, { $group: { _id: "$patient", count: { $sum: 1 }, lastAppointment: { $max: "$appointmentDate" } } }, { $sort: { lastAppointment: -1 } }, { $limit: 100 }]),
      Booking.aggregate([{ $match: { ...own, status: "completed", paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$doctorPayableAmount" } } }]),
      Booking.distinct("patient", own),
      Booking.aggregate([
        { $match: { ...own, appointmentDate: { $gte: trendStart, $lt: todayEnd } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate", timezone: "Asia/Dhaka" } },
          appointments: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          earnings: { $sum: { $cond: [{ $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "paid"] }] }, "$doctorPayableAmount", 0] } },
        } },
        { $sort: { _id: 1 } },
      ]),
      Booking.aggregate([
        { $match: own },
        { $group: { _id: "$consultationType", count: { $sum: 1 } } },
      ]),
    ]);
    const trendByDate = new Map(trendRows.map((item) => [item._id, item]));
    const trend = Array.from({ length: 30 }, (_, index) => {
      const date = getDhakaDateKey(new Date(trendStart.getTime() + index * 86400000));
      const row = trendByDate.get(date);
      return { date, appointments: row?.appointments || 0, completed: row?.completed || 0, earnings: Number(row?.earnings || 0) };
    });
    const consultationTypes = { online: 0, chamber: 0, home: 0 };
    typeRows.forEach((item) => {
      const type = item._id === "home-visit" ? "home" : item._id;
      if (type in consultationTypes) consultationTypes[type] += item.count;
    });
    const patientUsers = await User.find({ _id: { $in: patients.map((item) => item._id) } }).select("fullName phone phoneNumber").lean();
    const byId = new Map(patientUsers.map((user) => [String(user._id), user]));
    return res.status(200).json({
      doctor,
      stats: {
        today: today.length, upcoming, completed, cancelled, totalPatients: uniquePatients.length,
        onlineToday: today.filter((item) => (item.consultationType || item.consultationMode) === "online").length,
        chamberToday: today.filter((item) => (item.consultationType || item.consultationMode) === "chamber").length,
        homeToday: today.filter((item) => ["home", "home-visit"].includes(item.consultationType || item.consultationMode)).length,
        earnings: Number(earnings[0]?.total || 0),
      },
      charts: { trend, consultationTypes },
      today, patients: patients.map((item) => ({ ...item, user: byId.get(String(item._id)) || null })),
    });
  } catch (error) {
    console.error("Doctor dashboard error", error);
    return res.status(500).json({ error: "Could not load doctor dashboard." });
  }
});

export default handler;
