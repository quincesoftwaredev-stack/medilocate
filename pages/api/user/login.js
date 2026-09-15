import UserService from '@/services/user-service'
import nextConnect from 'next-connect'
import { serialize } from 'cookie'

const handler = nextConnect()

handler.post(async (req, res) => {
  try {
    const service = new UserService()
    const { email, password } = req.body
    const user = await service.SignIn({
      email,
      password: password
    })

    if (user?.token) {
      res.setHeader('Set-Cookie', serialize('userInfo', JSON.stringify(user), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      }))
    }

    return res.status(200).json(user)
  } catch (error) {
    res.status(400)
  }
})

export default handler
