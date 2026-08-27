import SSLCommerzPayment from 'sslcommerz-lts'
import db from '@/database/connection'
import Order from '@/database/model/Orders'
import nc from 'next-connect'
import { isAuth } from '@/utility'
import BASE_URL from '@/config'

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

    const deleted = await Order.findByIdAndDelete(
      orderId // The ID of the order to update
    )

    console.log('Incoming request to update order:', orderId)
    res.redirect(`${BASE_URL}`) // Just for testing
  } catch (error) {
    console.log(error)
  }
})

export default handler
