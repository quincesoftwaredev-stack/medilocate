// pages/api/addresses/index.js

import db from '@/database/connection'
import Address from '@/database/model/Address'
import { isAdmin, isAuth } from '@/utility'
import nc from 'next-connect'
const PAGE_SIZE = 50

const handler = nc()

// Create a new address
handler.post(async (req, res) => {
  await db.connect()
  try {
    const newAddress = await Address.create(req.body)
    res.status(201).json(newAddress)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

handler.use(isAuth, isAdmin)
handler.get(async (req, res) => {
  try {
    await db.connect()
    const page = parseInt(req.query.page) || 1
    const { query, position } = req.query

    // Calculate the skip value based on the page number and page size
    const skip = (page - 1) * PAGE_SIZE
    const filter = {}

    // Build the filter conditions for the shippingAddress
    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }

    if (
      position != 'all' &&
      position != '' &&
      position != undefined &&
      position != 'undefined'
    ) {
      filter.position = { $regex: position, $options: 'i' }
    }

    // console.log(addressFilter)

    const [totalCount, addresses] = await Promise.all([
      Address.countDocuments(filter),
      Address.find(filter).sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean()
    ])

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    // console.log({ addresses, totalPages, totalCount })
    await db.disconnect()
    return res
      .status(200)
      .json({ page, totalPages, count: totalCount, addresses })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
