// pages/api/products/filter.js

import db from '@/database/connection'
import Product from '@/database/model/Product'
import Category from '@/database/model/Category'
import { ExtractColors, getPlaceholderImage } from '@/utility/image'
import nc from 'next-connect'

const handler = nc()

function sortArrayByKey(arr, key, order = 'asc') {
  if (!Array.isArray(arr) || arr.length === 0) {
    return []
  }

  // Determine if the key is numeric or date to handle sorting accordingly
  const isNumericKey = typeof arr[0][key] === 'number'
  const isDateKey =
    !isNumericKey &&
    new Date(arr[0][key]) !== 'Invalid Date' &&
    !isNaN(new Date(arr[0][key]))

  return arr.sort((a, b) => {
    let comparison = 0

    if (isNumericKey) {
      comparison = a[key] - b[key]
    } else if (isDateKey) {
      comparison = new Date(a[key]) - new Date(b[key])
    } else {
      if (a[key] < b[key]) comparison = -1
      if (a[key] > b[key]) comparison = 1
    }

    return order === 'desc' ? -comparison : comparison
  })
}

handler.get(async (req, res) => {
  try {
    // Extract filter parameters from the query string
    let {
      name,
      minPrice,
      maxPrice,
      categories,
      colors,
      page,
      sortBy, // New parameter for sorting
      sortOrder, // New parameter for sorting order,
      limit = 10,
      blur
    } = req.query

    // Construct the filter object based on the provided parameters
    const filter = {}

    if (name) {
      filter.name = { $regex: name, $options: 'i' } // Case-insensitive search for product name
    }

    if (minPrice && maxPrice && minPrice != 'all' && maxPrice != 'all') {
      filter.priceWithDiscount = { $gte: minPrice, $lte: maxPrice } // Filter products by price range
    } else if (minPrice && minPrice != 'all') {
      filter.priceWithDiscount = { $gte: minPrice } // Filter products with price greater than or equal to minPrice
    } else if (maxPrice && maxPrice != 'all') {
      filter.priceWithDiscount = { $lte: maxPrice } // Filter products with price less than or equal to maxPrice
    }

    if (categories && categories != 'all') {
      filter.categories = { $in: categories.split(',') } // Filter products by category
    }

    if (colors && colors != 'all') {
      filter.colors = { $in: colors.split(',') } // Filter products by colors
    }

  

    page = page || 1
    const skip = (page - 1) * limit
    console.log({ filter })
    await db.connect()

    // Query the database with the constructed filter object
    const [count, productsResult] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter, { metaTitle: 0, images: 0, description: 0 })
        .lean()
        .populate({ path: 'categories', select: 'name' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ])
    const totalPages = Math.ceil(count / limit)
    let products = productsResult

    // if (blur) {
    //   products = await Promise.all(
    //     products.map(async p => {
    //       const blurData = await getPlaceholderImage(p.thumbnail, 5, 10)
    //       return {
    //         ...p.toObject(), // Ensure you're working with plain objects
    //         blurData: blurData.placeholder
    //       }
    //     })
    //   )
    // }





    // Sorting
    if (sortBy && sortOrder) {
      console.log({ sortBy, sortOrder })
      if (sortOrder === 'desc') {
        products = sortArrayByKey(products, sortBy, 'desc')
      } else {
        products = sortArrayByKey(products, sortBy, 'asc')
      }
    }

    return res.status(200).json({ totalPages, count, page, products })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
