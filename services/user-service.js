import UserRepository from '@/database/repository/user-repository'
import bcrypt from 'bcryptjs'

import {
  GenerateSalt,
  GeneratePassword,
  ValidatePassword,
  GenerateSignature,
  ValidateSignature,
  FormateData
} from '../utility/index'
import { generateUniqueID, generateVerificationCode } from '@/utility/helper'
import Mail from './mail-service'
import Message from './message-service'
import { companyName } from '@/utility/const'

class UserService {
  constructor() {
    this.repository = new UserRepository()
    this.mailService = new Mail()
    this.messageService = new Message()
  }

  async SignUp(userInputs) {
    const { email, password, phone } = userInputs
    const existingUser = await this.repository.FindUser({ phone, email })
    if (existingUser) {
      return FormateData({ error: 'Phone or Email Already Exist !' })
    }
    let salt = await GenerateSalt()
    let userPassword = await GeneratePassword(password, salt)

    const verificationCode = generateUniqueID([])
    const expirationTime = new Date()
    expirationTime.setMinutes(expirationTime.getMinutes() + 5)
    // const profileId = await this.repository.generateId()
    this.messageService.sendMessage({
      message: `Your Verification Code for Medilocate is ${verificationCode}. This code will expire in 5 minutes.`,
      number:phone
    })

    const prefix = userInputs.role == "doctor" ? "DT" : userInputs.role == "nurse" ? "NS" : "PT"
    const uid = prefix + generateUniqueID([])


    const existUser = await this.repository.CreateUser({
      ...userInputs,
      password: userPassword,
      salt,
      verificationCode,
      expirationTime,
      uid
    })

  
    // send code to mail
    // this.mailService.sendMail({
    //   code: verificationCode,
    //   expirationTime: '5 minutes',
    //   to: existUser.email,
    //   name: existUser.firstName,
    //   for: 'verification',
    //   verification: true,
    //   subject: `Account Verification -${companyName}`
    // })



    console.log({ existUser })

    const token = await GenerateSignature({
      email: email,
      _id: existUser._id,
      role: existUser.role
    })

    return FormateData({
      id: existUser._id,
      token,
      role: existUser.role
    })
  }

  async SignIn(userInputs) {
    try {
      console.log(userInputs)
      const { email, password } = userInputs
      const existingUser = await this.repository.FindUser({ email, phone: email })
      if (!existingUser) {
        return FormateData({ error: 'User Not Found With This Email or Phone Number !' })
      }
      if (existingUser) {
        if (!existingUser.password) {
          return FormateData({ error: 'Set a password to continue.', code: 'PASSWORD_SETUP_REQUIRED' })
        }
        const validPassword = existingUser.salt
          ? await ValidatePassword(password.toString(), existingUser.password, existingUser.salt)
          : await bcrypt.compare(password.toString(), existingUser.password)
        if (validPassword) {
          const token = await GenerateSignature({
            email: existingUser.email,
            _id: existingUser._id,
            role: existingUser.role
          })
          return FormateData({
            id: String(existingUser._id),
            _id: String(existingUser._id),
            token,
            role: existingUser.role,
            fullName: existingUser.fullName,
            email: existingUser.email,
            phone: existingUser.phone
          })
        } else {
          return FormateData({ error: "Password Didn't Match !" })
        }
      }

      return FormateData({ error: 'User Not Found' })
    } catch (error) {
      console.error('Sign in failed:', error.message)
      return FormateData({ error: 'Login is temporarily unavailable.' })
    }
  }

  async FindUserProfileById(userId) {
    try {
      const existingUser = await this.repository.FindUserProfileById(userId)
      return FormateData(existingUser)
    } catch (error) {
      console.log(error)
    }
  }

  async UpdateUser(userInputs) {
    try {
      const { email, password, ...DataToUpdate } = userInputs
      const existingUser = await this.repository.UpdateUser(DataToUpdate)
      return FormateData(existingUser)
    } catch (error) {
      console.log(error)
    }
  }

  async DeleteUserById(userId) {
    try {
      const result = await this.repository.DeleteUserById(userId)
      if (result) {
        return FormateData({
          message: 'Deleted Sucessfully'
        })
      } else {
        return FormateData({
          error: 'Something Went Wrong'
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export default UserService
