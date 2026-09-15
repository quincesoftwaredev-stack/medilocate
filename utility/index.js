import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { APP_SECRET } from '@/config'

const GenerateSalt = async () => {
  return await bcrypt.genSalt(10)
}

const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt)
}

const ValidatePassword = async (enteredPassword, savedPassword, salt) => {
  return (await GeneratePassword(enteredPassword, salt)) == savedPassword
}

const GenerateSignature = async payload => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: '30d' })
  } catch (error) {
    console.log(error)
    return error
  }
}

const ValidateSignature = async req => {
  try {
    const { authorization: signature } = req.headers
    const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET)
    req.user = payload
    return true
  } catch (error) {
    return false
  }
}

const isAuth = async (req, res, next) => {
  const isAuthorized = await ValidateSignature(req)
  if (isAuthorized) {
    return next()
  }
  return res.status(403).json({ message: 'Not Authorized' })
}

const isAdmin = async (req, res, next) => {
  if (req.user.role == 'admin') {
    return next()
  }
  return res.status(403).json({ message: 'Not Authorized' })
}
const FormateData = data => {
  if (data) {
    return data
  } else {
    throw new Error('Data Not found!')
    console.log({ data })
  }
}

export {
  GenerateSalt,
  GeneratePassword,
  ValidatePassword,
  GenerateSignature,
  ValidateSignature,
  FormateData,
  isAuth,isAdmin
}
