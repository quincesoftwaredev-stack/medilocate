import SSLCommerzPayment from 'sslcommerz-lts'
import db from '@/database/connection'
import Order from '@/database/model/Orders'
import nc from 'next-connect'
import { isAuth } from '@/utility'
import BASE_URL from '@/config'
import { NextResponse } from 'next/server'

const handler = nc()

const store_id = process.env.store_id
const store_passwd = process.env.store_passwd
const is_live = process.env.is_live == 'false' ? false : true //true for live, false for sandbox

handler.post(async (req, res) => {
  try {
    const orderId = req.query.id

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, // The ID of the order to update
      { $set: { paymentStatus: 'completed' } }, // Update the payment status to 'completed'
      { new: true } // Return the updated document
    )

    res.status(200).redirect(`/orders/${orderId}`)
  } catch (error) {
    console.log(error)
  }
})

export default handler
