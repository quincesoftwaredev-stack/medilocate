import nextConnect from "next-connect";

import db from "@/database/connection";
import Order from "@/database/model/Orders";

const handler = nextConnect();

const normalizePhoneVariants = (value) => {
    const digits = value.replace(/\D/g, "");
    const local = digits.slice(-10);
    return [...new Set([
        value.trim(),
        digits,
        local,
        local ? `0${local}` : "",
        local ? `880${local}` : "",
        local ? `+880${local}` : "",
    ].filter(Boolean))];
};

const summarizeOrder = (order) => ({
    lookupId: order.trackingNumber || String(order._id),
    trackingNumber: order.trackingNumber,
    reference: order.trackingNumber || `Order ${String(order._id).slice(-8).toUpperCase()}`,
    status: order.status || "pending",
    paymentStatus: order.paymentStatus || "pending",
    total: Number(order.total || 0),
    totalItems: (order.items || []).reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    ),
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
});

handler.post(async (req, res) => {
    const query = String(req.body?.query || "").trim();
    const isTrackingNumber = /^ML-TRK-[A-Z0-9-]{4,}$/i.test(query);
    const phoneDigits = query.replace(/\D/g, "");
    const isPhoneNumber = /^\+?[\d\s()-]+$/.test(query)
        && phoneDigits.length >= 10
        && phoneDigits.length <= 15;

    if (!isTrackingNumber && !isPhoneNumber) {
        return res.status(400).json({
            message: "Enter a valid tracking number or complete phone number.",
        });
    }

    try {
        await db.connect();

        const filter = isTrackingNumber
            ? { trackingNumber: query.toUpperCase() }
            : { "delivery.phone": { $in: normalizePhoneVariants(query) } };

        const orders = await Order.find(filter)
            .select("trackingNumber status paymentStatus total items.quantity createdAt")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        if (!orders.length) {
            return res.status(404).json({
                message: "No order matched the information you entered.",
            });
        }

        return res.status(200).json({
            mode: isTrackingNumber ? "tracking" : "phone",
            orders: orders.map(summarizeOrder),
        });
    } catch (error) {
        console.error("ORDER TRACKING LOOKUP ERROR:", error);
        return res.status(500).json({
            message: "Order tracking is temporarily unavailable.",
        });
    }
});

export default handler;
