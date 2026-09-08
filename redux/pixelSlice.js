import { createSlice } from '@reduxjs/toolkit'
import { trackPixelEvent } from '@/utility/pixel'

export const pixelSlice = createSlice({
  name: 'state',
  initialState: { pixel: null },
  reducers: {
    setPixel: (state, action) => {
      // SDK functions stay outside serializable Redux state.
      state.pixel = action.payload ? true : null
    },
    handleViewProduct: (state, { payload }) => { trackPixelEvent('ViewContent', { value: Number(payload?.price) }) },
    handleAddItemToCart: () => { trackPixelEvent('AddToCart') },
    handleInitiateCheckout: (state, { payload }) => { trackPixelEvent('InitiateCheckout', payload) },
    handlePurchase: (state, { payload }) => { if (payload?.id || payload?._id) trackPixelEvent('Purchase', { value: Number(payload.total), num_items: payload.num_items }, String(payload.id || payload._id)) },
    handleContact: () => { trackPixelEvent('Contact') },
    handleAddPaymentInfo: (state, { payload }) => { trackPixelEvent('AddPaymentInfo', payload) },
    handleSearch: () => { trackPixelEvent('Search') }
  }
})

export const {
  setPixel, handleViewProduct, handleInitiateCheckout, handleAddItemToCart,
  handlePurchase, handleAddPaymentInfo, handleSearch, handleContact
} = pixelSlice.actions
export default pixelSlice.reducer
