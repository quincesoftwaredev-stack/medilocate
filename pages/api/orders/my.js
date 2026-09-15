import nextConnect from "next-connect";
import db from "@/database/connection";
import Order from "@/database/model/Orders";
import User from "@/database/model/User";
import "@/database/model/Medicine";
import { isAuth } from "@/utility";

const handler = nextConnect();
handler.use(isAuth);

const phoneVariants = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  const local = digits.slice(-10);
  return [...new Set([String(value).trim(), digits, local, local ? `0${local}` : "", local ? `880${local}` : "", local ? `+880${local}` : ""].filter(Boolean))];
};

handler.get(async (req, res) => {
  try {
    await db.connect();
    const user = await User.findById(req.user._id).select("phone").lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    const filters = [{ user: req.user._id }];
    if (user.phone) filters.push({ "delivery.phone": { $in: phoneVariants(user.phone) } });

    const orders = await Order.find({ $or: filters })
      .populate("items.medicine", "name genericName strength")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("USER ORDERS ERROR:", error);
    return res.status(500).json({ message: "Orders could not be loaded." });
  }
});

export default handler;
