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
import Payment from '@/database/model/Payment'

const handler = nc()

const store_id = process.env.store_id
const store_passwd = process.env.store_passwd
const is_live = process.env.is_live == 'false' ? false : true //true for live, false for sandbox

handler.get(async (req, res) => {
  try {
    await db.connect()
    const payment = await Payment.findOne({ _id: req.query.id })
    const data = {
      refund_ref_id: payment.refund.refundRefId
    }
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.refundQuery(data).then(data => {
      console.log(data)
      return res.status(200).json(data)
    })
    await db.disconnect()
    // res.status(200).send('ok')
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error })
  }
})

export default handler
