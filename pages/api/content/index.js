// Import necessary modules and models
import db from '@/database/connection'
import Content from '@/database/model/Content'
import { isAdmin, isAuth } from '@/utility'
import nc from 'next-connect'
import slugify from 'slugify'
const PAGE_SIZE = 20
const handler = nc()

// get all the content
handler.get(async (req, res) => {
  try {
    await db.connect()
    // Get the page number from the query parameters, default to 1
    const page = parseInt(req.query.page) || 1
    let query = {}
    if (req.query.show) {
      query['isShown'] = true
    }
    // Calculate the skip value based on the page number and page size
    const skip = (page - 1) * (req.query.pageSize || PAGE_SIZE)
    // Retrieve total count of products
    const [totalCount, contents] = await Promise.all([
      Content.countDocuments(),
      Content.find(query).sort({ updatedAt: -1 }).skip(skip).limit(PAGE_SIZE).lean()
    ])

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    // await db.disconnect()
    res.json({ page, contents, totalPages })
  } catch (error) {
    console.log({ error })
    res.status(500).json({ message: 'Server Error' })
  }
})

handler.use(isAuth, isAdmin)
// Create a new content
handler.post(async (req, res) => {
  try {
    await db.connect()

    const content = await Content.create({
      ...req.body
    })
    // await db.disconnect()
    res.status(201).json(content)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
