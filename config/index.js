let BASE_URL, MONGODB_URI, GMAIL, PASSWORD, PIXEL_ID

// for development environement
if (process.env.NODE_ENV !== 'production') {
  BASE_URL = 'http://localhost:3000'
  MONGODB_URI = process.env.MONGODB_URI
  GMAIL = process.env.GMAIL_USER_DEV
  PASSWORD = process.env.GMAIL_PASS_DEV
  PIXEL_ID = '1104666211997295'
} else {
  BASE_URL = 'https://medilocate.health'
  // BASE_URL = 'https://ecomerce-phi-gold.vercel.app'
  // BASE_URL = 'https://electronics-52h4.vercel.app'
  // BASE_URL = "https://stylehive-kohl.vercel.app"
  MONGODB_URI = process.env.MONGODB_URI

  GMAIL = process.env.GMAIL_USER
  PASSWORD = process.env.GMAIL_PASS
  PIXEL_ID = '1104666211997295'
}

const APP_SECRET = process.env.APP_SECRET
const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
export default BASE_URL
export { APP_SECRET, MONGODB_URI, GMAIL, PASSWORD, PIXEL_ID, NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }

export const PRICING_CONFIG = {
  discountEnabled: true,
  discountType: "percentage",
  discountPercentage: 10,
  discountMinOrderAmount: 0,
  maxDiscountAmount: null,
  discountAppliesToDeliveryCharge: false,
  deliveryCharge: 29,
  freeDeliveryEnabled: true,
  freeDeliveryMinOrderAmount: 499,
  targetDeliveryTimeMinutes: 30,
  serviceCity: "Rangpur",
};
