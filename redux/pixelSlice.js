import { createSlice } from '@reduxjs/toolkit'
import { trackPixelEvent } from '@/utility/pixel'

const getSafeValue = (value) => {
  try {
    const number = Number(value)
    return Number.isFinite(number) && number >= 0 ? number : undefined
  } catch {
    return undefined
  }
}

// Only generic monetary values are allowed; never send health or product details.
const getConversionData = (payload) => {
  const value = getSafeValue(payload?.total ?? undefined)
    ?? getSafeValue(payload?.totalAmount ?? undefined)
    ?? getSafeValue(payload?.amount ?? undefined)
  return value === undefined ? undefined : { value, currency: 'BDT' }
}

export const pixelSlice = createSlice({
  name: 'pixel',
  initialState: { pixel: null },
  reducers: {
    setPixel: (state, action) => {
      // SDK functions stay outside serializable Redux state.
      state.pixel = action.payload ? true : null
    },
    handleViewProduct: (state, { payload }) => {
      const value = getSafeValue(payload?.price ?? undefined)
      if (value === undefined) trackPixelEvent('ViewContent')
      else trackPixelEvent('ViewContent', { value, currency: 'BDT' })
    },
    handleAddItemToCart: () => { trackPixelEvent('AddToCart') },
    handleInitiateCheckout: (state, { payload }) => {
      const data = getConversionData(payload)
      if (data) trackPixelEvent('InitiateCheckout', data)
      else trackPixelEvent('InitiateCheckout')
    },
    handlePurchase: (state, { payload }) => {
      const data = getConversionData(payload)
      const eventId = payload?.id || payload?._id
      if (eventId) trackPixelEvent('Purchase', data, String(eventId))
      else if (data) trackPixelEvent('Purchase', data)
      else trackPixelEvent('Purchase')
    },
    handleContact: () => { trackPixelEvent('Contact') },
    // Search queries and payment details can reveal sensitive information.
    handleAddPaymentInfo: () => { trackPixelEvent('AddPaymentInfo') },
    handleSearch: () => { trackPixelEvent('Search') }
  }
})

export const {
  setPixel, handleViewProduct, handleInitiateCheckout, handleAddItemToCart,
  handlePurchase, handleAddPaymentInfo, handleSearch, handleContact
} = pixelSlice.actions
export default pixelSlice.reducer
