import db from '@/database/connection'
import User from '@/database/model/User'
import UserService from '@/services/user-service'
import { GenerateSignature } from '@/utility'
import bcrypt from 'bcryptjs'
import nextConnect from 'next-connect'

const handler = nextConnect()

handler.post(async (req, res) => {
  try {
    await db.connect()
    const { code, newPassword } = req.body

    if (!code || !newPassword) {
      res.status(200).json({ error: 'Fill All The Field !' })
      return
    }

    const user = await User.findOne({ verificationCode: code })

    // Check if the user exists and if the provided code matches
    if (!user) {
      res.status(200).json({ error: 'Invalid verification code.' })
      return
    }

    // Check if the code has expired
    if (user.expirationTime && new Date() > new Date(user.expirationTime)) {
      console.log('expired')
      return res.status(200).json({ error: 'Verification code has expired.' })
    }

    // Update isVerified field to true
    user.isVerified = true
    // Clear verification code and expiration time
    user.verificationCode = undefined
    user.expirationTime = undefined
    user.password = await bcrypt.hash(String(newPassword), 10)
    user.salt = undefined

    // Save the updated user document
    await user.save()
    const token = await GenerateSignature({
      email: user.email,
      _id: user._id,
      isVerified: user.isVerified
    })
    // Return success response
    return res.status(200).json({
      id: user._id,
      token,
      name: user.name,
      active: user.active,
      isVerified: user.isVerified
    })
  } catch (error) {
    console.log(error)
    res.status(400)
  }
})

export default handler
