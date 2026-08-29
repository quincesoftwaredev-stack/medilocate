import db from "@/database/connection";
import Booking from "@/database/model/Booking";
import Doctor from "@/database/model/Doctor";
import Medicine from "@/database/model/Medicine";
import Order from "@/database/model/Orders";
import Prescription from "@/database/model/Prescription";
import nextConnect from "next-connect";

const handler = nextConnect();

const ORDER_STATUSES = [
    "pending",
    "preparing",
    "ready",
    "assigned",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "failed",
];

const PRESCRIPTION_STATUSES = [
    "pending",
    "reviewing",
    "medicines_identified",
    "order_created",
    "completed",
    "cancelled",
    "rejected",
];

const startOfDay = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
};

const addDays = (date, days) => {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
};

const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const resolvePeriod = (query) => {
    const now = new Date();
    const today = startOfDay(now);
    const period = query.period || "last_7_days";

    if (period === "today") {
        return { period, start: today, end: addDays(today, 1) };
    }

    if (period === "last_30_days") {
        return { period, start: addDays(today, -29), end: addDays(today, 1) };
    }

    if (period === "custom" && query.startDate && query.endDate) {
        const start = startOfDay(query.startDate);
        const end = addDays(startOfDay(query.endDate), 1);

        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start < end) {
            return { period, start, end };
        }
    }

    return {
        period: "last_7_days",
        start: addDays(today, -6),
        end: addDays(today, 1),
    };
};

const mapCounts = (rows, values) => {
    const result = Object.fromEntries(values.map((value) => [value, 0]));
    rows.forEach((row) => {
        if (row._id in result) result[row._id] = row.count;
    });
    return result;
};

const fillTrend = (rows, start, end) => {
    const byDate = new Map(rows.map((row) => [row._id, row]));
    const result = [];

    for (let date = new Date(start); date < end; date = addDays(date, 1)) {
        const key = toDateKey(date);
        const row = byDate.get(key) || {};
        result.push({
            date: key,
            orders: row.orders || 0,
            delivered: row.delivered || 0,
            revenue: row.revenue || 0,
        });
    }

    return result;
};

handler.get(async (req, res) => {
    try {
        await db.connect();

        const { period, start, end } = resolvePeriod(req.query);
        const periodFilter = { createdAt: { $gte: start, $lt: end } };
        const todayStart = startOfDay(new Date());
        const tomorrow = addDays(todayStart, 1);

        const [
            totalOrders,
            deliveredMetrics,
            currentPendingOrders,
            pendingPrescriptions,
            lowStockCount,
            todayAppointments,
            orderStatusRows,
            prescriptionStatusRows,
            orderTrendRows,
            orderSourceRows,
            recentOrders,
            recentPrescriptions,
            inventoryCounts,
            lowStockMedicines,
            bestSellingMedicines,
            doctorCounts,
            todayAppointmentStatuses,
            failedOrders,
        ] = await Promise.all([
            Order.countDocuments(periodFilter),
            Order.aggregate([
                { $match: { ...periodFilter, status: "delivered" } },
                { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
            ]),
            Order.countDocuments({ status: "pending" }),
            Prescription.countDocuments({ status: "pending" }),
            Medicine.countDocuments({
                status: "active",
                $expr: { $lte: ["$stock", "$reorderLevel"] },
            }),
            Booking.countDocuments({
                dateOfConsultation: { $gte: todayStart, $lt: tomorrow },
            }),
            Order.aggregate([
                { $match: periodFilter },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Prescription.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: periodFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        orders: { $sum: 1 },
                        delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                        revenue: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, "$total", 0] } },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Order.aggregate([
                { $match: periodFilter },
                { $group: { _id: { $cond: [{ $ne: ["$prescription", null] }, "prescription", "cart"] }, count: { $sum: 1 } } },
            ]),
            Order.find({})
                .select("trackingNumber delivery total paymentStatus status prescription createdAt")
                .sort({ createdAt: -1 })
                .limit(8)
                .lean(),
            Prescription.find({ status: { $in: ["pending", "reviewing"] } })
                .select("requestCode patient status files createdAt")
                .sort({ createdAt: 1 })
                .limit(6)
                .lean(),
            Promise.all([
                Medicine.countDocuments({ status: "active" }),
                Medicine.countDocuments({ status: "active", prescriptionRequired: true }),
                Medicine.countDocuments({ status: "active", stock: 0 }),
                Medicine.countDocuments({ status: "active", stock: { $gt: 0 }, $expr: { $lte: ["$stock", "$reorderLevel"] } }),
            ]),
            Medicine.find({
                status: "active",
                $expr: { $lte: ["$stock", "$reorderLevel"] },
            })
                .select("name genericName strength stock reorderLevel")
                .sort({ stock: 1, name: 1 })
                .limit(6)
                .lean(),
            Order.aggregate([
                { $match: { ...periodFilter, status: "delivered" } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.medicine",
                        quantity: { $sum: "$items.quantity" },
                        revenue: { $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } },
                    },
                },
                { $sort: { quantity: -1 } },
                { $limit: 5 },
                { $lookup: { from: "medicines", localField: "_id", foreignField: "_id", as: "medicine" } },
                { $unwind: { path: "$medicine", preserveNullAndEmptyArrays: true } },
                { $project: { _id: 1, quantity: 1, revenue: 1, name: { $ifNull: ["$medicine.name", "Deleted medicine"] }, strength: "$medicine.strength" } },
            ]),
            Promise.all([
                Doctor.countDocuments({ status: "active", verificationStatus: "verified" }),
                Doctor.countDocuments({ verificationStatus: "pending" }),
            ]),
            Booking.aggregate([
                { $match: { dateOfConsultation: { $gte: todayStart, $lt: tomorrow } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Order.countDocuments({ status: "failed" }),
        ]);

        const delivered = deliveredMetrics[0] || { revenue: 0, count: 0 };
        const orderStatuses = mapCounts(orderStatusRows, ORDER_STATUSES);
        const prescriptionStatuses = mapCounts(prescriptionStatusRows, PRESCRIPTION_STATUSES);
        const appointmentStatuses = mapCounts(todayAppointmentStatuses, [
            "pending",
            "confirmed",
            "completed",
            "cancelled",
            "no-show",
        ]);
        const sourceMap = Object.fromEntries(orderSourceRows.map((row) => [row._id, row.count]));

        return res.status(200).json({
            success: true,
            meta: {
                period,
                startDate: toDateKey(start),
                endDate: toDateKey(addDays(end, -1)),
                generatedAt: new Date().toISOString(),
            },
            kpis: {
                deliveredRevenue: delivered.revenue || 0,
                deliveredOrders: delivered.count || 0,
                totalOrders,
                pendingOrders: currentPendingOrders,
                pendingPrescriptions,
                lowStockMedicines: lowStockCount,
                todayAppointments,
                averageOrderValue: delivered.count ? delivered.revenue / delivered.count : 0,
                completionRate: totalOrders ? (delivered.count / totalOrders) * 100 : 0,
            },
            actionRequired: {
                pendingPrescriptions,
                ordersAwaitingPreparation: currentPendingOrders,
                lowStockMedicines: lowStockCount,
                failedOrders,
                pendingDoctorVerification: doctorCounts[1],
            },
            orders: {
                statuses: orderStatuses,
                sources: {
                    cart: sourceMap.cart || 0,
                    prescription: sourceMap.prescription || 0,
                },
                trend: fillTrend(orderTrendRows, start, end),
                recent: recentOrders,
            },
            prescriptions: {
                statuses: prescriptionStatuses,
                recent: recentPrescriptions,
            },
            inventory: {
                active: inventoryCounts[0],
                prescriptionRequired: inventoryCounts[1],
                outOfStock: inventoryCounts[2],
                lowStock: inventoryCounts[3],
                alerts: lowStockMedicines,
                bestSelling: bestSellingMedicines,
            },
            doctors: {
                active: doctorCounts[0],
                pendingVerification: doctorCounts[1],
            },
            appointments: {
                today: todayAppointments,
                statuses: appointmentStatuses,
            },
        });
    } catch (error) {
        console.error("Admin dashboard API error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
});

export default handler;

