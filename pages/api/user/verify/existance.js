import db from '@/database/connection'
import User from '@/database/model/User'
import UserService from '@/services/user-service'
import { GenerateSignature } from '@/utility'
import { generateUniqueID, generateVerificationCode } from '@/utility/helper'
import nextConnect from 'next-connect'
const handler = nextConnect()
import Mail from '@/services/mail-service'
import Message from '@/services/message-service'
import { companyName } from '@/utility/const'

// Password Reset Code
// Check Existance of Mail , Send Verification Code to That Mail For Password Reset
handler.post(async (req, res) => {
  try {
    const { email } = req.body
    const mailService = new Mail()
    const messageService = new Message()

    await db.connect()

    const user = await User.findOne({
      $or: [
        { phone: email },
        { email: email }
      ]
    })

    if (!user) {
      return res.status(200).json({ error: 'User not found' })
    }

    const verificationCode = generateUniqueID([])
    user.verificationCode = verificationCode
    const expirationTime = new Date()
    expirationTime.setMinutes(expirationTime.getMinutes() + 5)
    user.expirationTime = expirationTime

    await user.save()
    console.log(user)
    // send notification with Password Reset Code
    messageService.sendMessage({
      message: `Your Verification Code for Medilocate is ${verificationCode}. This code will expire in 5 minutes.`,
      number: user.phone,
      sendInDevelopment: true
    })
    mailService.sendMail({
      code: verificationCode,
      expirationTime: '5 minutes',
      subject: `Account Password Reset -${companyName}`,
      to: user.email,
      for: 'Verification'
    })

    return res.status(200).json({ message: 'Code Sent To Your Mail' })
  } catch (error) {
    console.log(error)
    res.status(400)
  }
})

export default handler
