import SSLCommerzPayment from 'sslcommerz-lts'
import db from '@/database/connection'
import Order from '@/database/model/Orders'
import nc from 'next-connect'
import { isAuth } from '@/utility'
import BASE_URL from '@/config'
import { NextResponse } from 'next/server'
import Payment from '@/database/model/Payment'

const handler = nc()

const store_id = 'quinc66d679e90b3db'
const store_passwd = 'quinc66d679e90b3db@ssl'
const is_live = false // true for live, false for sandbox

//SSLCommerz initiateRefund

handler.get(async (req, res) => {
  await db.connect()
  const payment = await Payment.findOne({ _id: req.query.id })

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' })
  }

  try {
    const data = {
      refund_amount: payment.amount,
      refund_remarks: 'From Quince ...',
      bank_tran_id: payment.bankTransactionId,
      refe_id: payment._id
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const refundResponse = await sslcz.initiateRefund(data)
    console.log(refundResponse)
    if (refundResponse.status == 'success') {
      payment.refund.status = 'success'
      payment.refund.amount = payment.amount
      payment.refund.refundRefId = refundResponse.refund_ref_id
      await payment.save()
      return res.status(200).send('Refund Process Initiated !')
    }
    await db.disconnect()
    return res.status(200).send('Something Went Wrong')
  } catch (error) {
    console.log(error)
  }
})

export default handler
