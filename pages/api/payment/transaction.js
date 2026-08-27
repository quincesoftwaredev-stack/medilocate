import SSLCommerzPayment from 'sslcommerz-lts'
import db from '@/database/connection'
import Order from '@/database/model/Orders'
import nc from 'next-connect'
import { isAdmin, isAuth } from '@/utility'
import BASE_URL from '@/config'
import { NextResponse } from 'next/server'
import Payment from '@/database/model/Payment'

const handler = nc()

const store_id = process.env.store_id
const store_passwd = process.env.store_passwd
const is_live = process.env.is_live == 'false' ? false : true //true for live, false for sandbox

// handler.use(isAuth, isAdmin)
handler.get(async (req, res) => {
  try {
    await db.connect()
    const payment = await Payment.findOne({ _id: req.query.id })
    if (!payment.transactionId) {
      return res.status(400).json({ error: 'Payment Not found !' })
    }
    const data = {
      tran_id: payment.transactionId
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const responseData = await sslcz.transactionQueryByTransactionId(data)
    if (responseData) {
      console.log(responseData)
      return res.status(200).json(responseData)
    } else {
      return res.status(200).json({
        message: 'Transaction is invalid or not found'
      })
    }
    return
  } catch (error) {
    console.log(error)
  }
})

export default handler
