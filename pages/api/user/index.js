import db from '@/database/connection'
import User from '@/database/model/User'
import Message from '@/services/message-service'
import UserService from '@/services/user-service'
import { GeneratePassword, GenerateSalt, GenerateSignature, isAuth } from '@/utility'
import { generateUniqueID } from '@/utility/helper'
import nextConnect from 'next-connect'

const handler = nextConnect()
const messageService = new Message()
handler.post(async (req, res) => {
  try {
    await db.connect()
  // await User.collection.dropIndex("email_1"); // replace with actual index name
  // console.log("Email unique index removed");
    const { email, password, firstName, lastName, role, phone } = req.body

    // 🔎 Check Existing User
    const existingUser = await User.findOne({
      // $or: [{ phone }, { email }]
      phone
    })
    console.log(existingUser)

    if (existingUser) {
      console.log(existingUser.phone, existingUser.email)
      return res.status(200).json({
        error: "Phone or Email Already Exist!"
      })
    }

    // 🔐 Password Hashing
    const salt = await GenerateSalt()
    const userPassword = await GeneratePassword(password, salt)

    // 🔢 Verification Code
    const verificationCode = generateUniqueID([])
    const expirationTime = new Date()
    expirationTime.setMinutes(expirationTime.getMinutes() + 5)

    // 📩 Send SMS
    await messageService.sendMessage({
      message: `Your Verification Code for Medilocate is ${verificationCode}. This code will expire in 5 minutes.`,
      number: phone
    })

    // 🆔 Generate UID based on role
    const prefix =
      role === "doctor"
        ? "DT"
        : role === "nurse"
          ? "NS"
          : "PT"

    const uid = prefix + generateUniqueID([])

    // 💾 Create User
    const newUser = await User.create({
      email,
      password: userPassword,
      salt,
      firstName,
      lastName,
      role,
      phone,
      verificationCode,
      expirationTime,
      uid
    })

    // 🔑 Generate JWT
    const token = await GenerateSignature({
      email: newUser.email,
      _id: newUser._id,
      role: newUser.role
    })

    return res.status(200).json({
      id: newUser._id,
      token,
      role: newUser.role
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: "Internal Server Error"
    })
  }
})


handler.get(async (req, res) => {
  try {
    // Extract filter parameters from the query string
    let {
      name,
      page,
      minPrice, maxPrice,
      sortBy, // New parameter for sorting
      sortOrder, // New parameter for sorting order,
      limit = 10,
      blur,
      categories
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




    page = page || 1
    const skip = (page - 1) * limit
    console.log({ filter })
    await db.connect()

    // Query the database with the constructed filter object
    const [count, usersResult] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter, { password: 0 })
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
    ])
    const totalPages = Math.ceil(count / limit)
    let users = usersResult

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

    return res.status(200).json({ totalPages, count, page, users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
