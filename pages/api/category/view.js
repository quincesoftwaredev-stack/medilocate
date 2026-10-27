// Import necessary modules and models
import db from '@/database/connection'
import Category from '@/database/model/Category'
import nc from 'next-connect'
import slugify from 'slugify'
const PAGE_SIZE = 20
const handler = nc()

// get all the category
handler.get(async (req, res) => {
  try {
    await db.connect()
    // Get the page number from the query parameters, default to 1
    // const page = parseInt(req.query.page) || 1

    // Calculate the skip value based on the page number and page size
    // const skip = (page - 1) * (req.query.pageSize || PAGE_SIZE)
    // Retrieve total count of products
    // const totalCount = await Category.countDocuments()

    // Calculate total pages
    // const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    // Retrieve products with pagination and sorting
    const categories = await Category.find({}).lean()
    const byParent = new Map()
    categories.forEach(item => {
      const key = item.parent ? String(item.parent) : 'root'
      if (!byParent.has(key)) byParent.set(key, [])
      byParent.get(key).push(item)
    })
    const tree = (byParent.get('root') || []).map(({ _id, name, image }) => ({
      name,
      _id,
      image,
      children: (byParent.get(String(_id)) || []).map(({ _id: childId, name: childName, image: childImage }) => ({
        name: childName,
        _id: childId,
        image: childImage,
        children: byParent.get(String(childId)) || []
      }))
    }))

    await db.disconnect()
    res.json(tree)
  } catch (error) {
    console.log({ error })
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
