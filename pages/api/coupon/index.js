import db from '@/database/connection'
import Product from '@/database/model/Product'
import Category from '@/database/model/Category'
import UserService from '@/services/user-service'
import { isAdmin, isAuth } from '@/utility'
import nextConnect from 'next-connect'
import slugify from 'slugify'
import Coupon from '@/database/model/Coupon'
const handler = nextConnect()
const PAGE_SIZE = 20

handler.use(isAuth, isAdmin)
handler.get(async (req, res) => {
  try {
    await db.connect()
    // Get the page number from the query parameters, default to 1
    const page = parseInt(req.query.page) || 1

    // Calculate the skip value based on the page number and page size
    const skip = (page - 1) * PAGE_SIZE
    // Retrieve total count of products
    const [totalCount, coupons] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean()
    ])

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)
    await db.disconnect()
    res.json({ page, coupons, totalPages })
  } catch (error) {
    console.log({ error })
    res.status(500).json({ message: 'Server Error' })
  }
})

handler.post(async (req, res) => {
  try {
    await db.connect()
    const { code, discount } = req.body

    // Check if the coupon code already exists
    const existingCoupon = await Coupon.findOne({ code })
    if (existingCoupon) {
      return res.status(200).json({ error: 'Coupon code already exists' })
    }
    const coupon = new Coupon({
      ...req.body,
      code,
      discount
    })

    await coupon.save()
    await db.disconnect()
    return res.status(201).json(coupon)
  } catch (error) {
    console.log({ error })
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
