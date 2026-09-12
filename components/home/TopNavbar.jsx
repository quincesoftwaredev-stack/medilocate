import { PRICING_CONFIG } from "@/config";
import styles from "./TopNavbar.module.css";

export default function TopNavbar() {
  const config = PRICING_CONFIG;
  if (!config.discountEnabled || config.discountType !== "percentage" || config.discountPercentage <= 0) {
    return null;
  }

  return (
    <aside className={styles.banner} aria-label="Medicine discount offer">
      <strong>{config.discountPercentage}% off</strong>{" "}
      {config.discountMinOrderAmount > 0
        ? "medicine orders from ৳" + config.discountMinOrderAmount
        : "on all orders"}
      {config.maxDiscountAmount != null && " — save up to ৳" + config.maxDiscountAmount}
    </aside>
  );
}
