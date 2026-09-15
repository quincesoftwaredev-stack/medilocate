import nextConnect from 'next-connect'
import { isAuth } from '@/utility'
import User from '@/database/model/User'
import db from '@/database/connection'

const handler = nextConnect()
handler.use(isAuth)
handler.get(async (req, res) => {
  try {

    // const service = new UserService()
    // const user = await service.FindUserProfileById(req.user._id)
    if (!(req.user.role === "admin" || String(req.query.id) === String(req.user._id))) {
      return res.status(403).json({ error: "Not authorized." })
    }
    await db.connect()
    const user = await User.findById(req.query.id).select("-password -salt -verificationCode -expirationTime");
    if (!user) return res.status(404).json({ error: "User not found." })
    return res.status(200).json(user)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

handler.put(async (req, res) => {
  try {
    if (String(req.query.id) !== String(req.user._id)) return res.status(403).json({ error: 'Not authorized.' })
    const fullName = String(req.body.fullName || '').trim()
    if (!fullName) return res.status(400).json({ error: 'Full name is required.' })
    await db.connect()
    const user = await User.findByIdAndUpdate(req.user._id, {
      fullName,
      email: String(req.body.email || '').trim(),
      image: String(req.body.image || '').trim(),
      gender: ['Male', 'Female'].includes(req.body.gender) ? req.body.gender : undefined,
    }, { new: true, runValidators: true }).select('-password -salt -verificationCode -expirationTime')
    if (!user) return res.status(404).json({ error: 'User not found.' })
    return res.status(200).json(user)
  } catch (error) {
    console.error('Profile update failed', { reason: error.message })
    return res.status(500).json({ error: 'Profile could not be updated.' })
  }
})
handler.delete(async (req, res) => {
  try {
    if (!(req.user.role === "admin" || String(req.query.id) === String(req.user._id))) {
      return res.status(403).json({ error: "Not authorized." })
    }
    await db.connect()
    const data = await User.findByIdAndDelete(req.query.id)
    if (!data) return res.status(404).json({ error: "User not found." })
    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: "Account could not be deleted." })
  }
})
export default handler
