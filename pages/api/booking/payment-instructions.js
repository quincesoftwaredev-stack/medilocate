import { whatsapp } from "@/utility/const";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const fallbackNumber = String(whatsapp || "").replace(/^88/, "");
  const merchantNumber = process.env.BKASH_MERCHANT_NUMBER || fallbackNumber;
  if (!merchantNumber) return res.status(503).json({ error: "Manual payment is not configured." });
  return res.status(200).json({
    provider: "bKash",
    merchantNumber,
    qrCodeUrl: process.env.NEXT_PUBLIC_BKASH_QR_URL || "",
    instruction: "Pay the exact amount, then submit the transaction ID for verification.",
  });
}
