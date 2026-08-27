// pages/api/orders/create.js

import db from '@/database/connection'
import Order from '@/database/model/Orders'
import Product from '@/database/model/Product'
import Payment from '@/database/model/Payment'
import nc from 'next-connect'
import { generateTrackingNumber } from '@/utility/helper'
import { isAdmin, isAuth } from '@/utility'
const handler = nc()
const PAGE_SIZE = 10

// handler.use(isAuth, isAdmin)
handler.get(async (req, res) => {
  try {
    await db.connect()
    const page = parseInt(req.query.page) || 1
    const { query, position } = req.query

    // Calculate the skip value based on the page number and page size
    const skip = (page - 1) * PAGE_SIZE
    const filter = {}

    // Build the filter conditions for the shippingPayment
    if (query) {
      filter.$or = [
        { transactionId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }

    // console.log(addressFilter)

    const totalCount = await Payment.countDocuments(filter)

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    // Perform the query with population and filtering
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)

    // console.log({ payments, totalPages, totalCount })
    await db.disconnect()
    return res
      .status(200)
      .json({ page, totalPages, count: totalCount, payments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
