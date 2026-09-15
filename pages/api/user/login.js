import UserService from '@/services/user-service'
import nextConnect from 'next-connect'
import { serialize } from 'cookie'

const handler = nextConnect()

handler.post(async (req, res) => {
  try {
    const service = new UserService()
    const { email, password } = req.body
    const user = await service.SignIn({ email, password })

    if (!user) {
      return res.status(500).json({ error: 'Login service is temporarily unavailable.' })
    }

    if (user.token) {
      try {
        res.setHeader('Set-Cookie', serialize('userInfo', JSON.stringify(user), {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }))
      } catch (cookieError) {
        // Client-side persistence remains available if the response cookie cannot be set.
        console.error('Login cookie could not be set:', cookieError.message)
      }
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error('Login API error:', error.message)
    return res.status(500).json({ error: 'Login is temporarily unavailable.' })
  }
})

export default handler
