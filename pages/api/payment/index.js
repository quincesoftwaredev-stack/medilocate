import SSLCommerzPayment from 'sslcommerz-lts'
import db from '@/database/connection'
import Order from '@/database/model/Orders'
import Product from '@/database/model/Product'
import Address from '@/database/model/Address'
import nc from 'next-connect'
import { generateTrackingNumber } from '@/utility/helper'
import { isAdmin, isAuth } from '@/utility'
import axios from 'axios'
import BASE_URL from '@/config'

const handler = nc()

const store_id = process.env.store_id
const store_passwd = process.env.store_passwd
const is_live = process.env.is_live == 'false' ? false : true //true for live, false for sandbox

// initial payment checkout
handler.post(async (req, res) => {
  try {
    const { data: order } = await axios.post(
      `${BASE_URL}/api/order/checkout`,
      req.body
    )
    // console.log({ order })
    const data = {
      total_amount: order.total,
      currency: 'BDT',
      tran_id: order.transactionId, // use unique tran_id for each api call
      success_url: `${BASE_URL}/order/${order._id}`,
      fail_url: `${BASE_URL}/api/payment/callback/canceled?id=${order._id}`,
      cancel_url: `${BASE_URL}/api/payment/callback/canceled?id=${order._id}`,
      ipn_url: `${BASE_URL}/api/payment/callback/ipn`,
      shipping_method: 'Courier',
      product_name: 'Computer.',
      product_category: 'Electronic',
      product_profile: 'general',
      cus_name: 'Customer Name',
      cus_email: 'customer@example.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh'
    }
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
      // Redirect the user to payment gateway
      let GatewayPageURL = apiResponse.GatewayPageURL
      res.status(200).send({ GatewayPageURL, ...order })
      console.log('Redirecting to: ', GatewayPageURL)
    })
  } catch (error) {
    console.log(error)
  }
})

export default handler
