import db from '@/database/connection'
import Product from '@/database/model/Product'
import Category from '@/database/model/Category'
import UserService from '@/services/user-service'
import { isAdmin, isAuth } from '@/utility'
import nextConnect from 'next-connect'
import { getPrice } from '@/utility/helper'
const handler = nextConnect()
const PAGE_SIZE = 20
import urlSlug from 'url-slug'

handler.get(async (req, res) => {
  try {
    await db.connect()
    // Get the page number from the query parameters, default to 1
    const page = parseInt(req.query.page) || 1

    // Calculate the skip value based on the page number and page size
    const skip = (page - 1) * PAGE_SIZE
    // Retrieve total count of products
    const [totalCount, products] = await Promise.all([
      Product.countDocuments(),
      Product.find()
        .populate({ path: 'categories', select: 'name' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean()
    ])

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)
    await db.disconnect()
    res.json({ page, products, totalPages })
  } catch (error) {
    console.log({ error })
    res.status(500).json({ message: 'Server Error' })
  }
})

handler.use(isAuth, isAdmin);
handler.post(async (req, res) => {
  try {
    await db.connect();
    
    const product = new Product({
      ...req.body,
      slug: urlSlug(req.body.name),
      priceWithDiscount: getPrice(req.body.price, req.body.discount),
      // Ensure 'sold' is handled correctly, either in schema or here
    });

    await product.save();
    await db.disconnect();

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    await db.disconnect(); // Ensure disconnection on error as well
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


export default handler
