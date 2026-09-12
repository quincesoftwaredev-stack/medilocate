import { PRICING_CONFIG } from '@/config';

export function calculatePricing(medicineSubtotal, config = PRICING_CONFIG) {
  const money = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const subtotal = money(Math.max(0, Number(medicineSubtotal) || 0));
  const freeDelivery = config.freeDeliveryEnabled && subtotal >= config.freeDeliveryMinOrderAmount;
  const deliveryFee = subtotal === 0 || freeDelivery ? 0 : money(Math.max(0, Number(config.deliveryCharge) || 0));
  const discountBase = subtotal + (config.discountAppliesToDeliveryCharge ? deliveryFee : 0);
  let discountAmount = 0;
  if (config.discountEnabled && config.discountType === 'percentage' && subtotal >= config.discountMinOrderAmount) {
    const percentage = Math.min(100, Math.max(0, Number(config.discountPercentage) || 0));
    discountAmount = discountBase * percentage / 100;
    if (config.maxDiscountAmount != null) {
      discountAmount = Math.min(discountAmount, Math.max(0, Number(config.maxDiscountAmount) || 0));
    }
  }
  discountAmount = money(Math.min(discountBase, discountAmount));
  return {
    subtotal,
    deliveryFee,
    discountAmount,
    total: money(subtotal + deliveryFee - discountAmount),
    amountUntilFreeDelivery: config.freeDeliveryEnabled
      ? money(Math.max(0, config.freeDeliveryMinOrderAmount - subtotal)) : 0,
  };
}
