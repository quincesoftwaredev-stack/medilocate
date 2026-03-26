// Import necessary modules and models
import db from '@/database/connection'
import Department from '@/database/model/Department'
import { isAdmin, isAuth } from '@/utility'
import nc from 'next-connect'
import slugify from 'slugify'

const handler = nc()

// Get category by ID
handler.get(async (req, res) => {
  try {
    const { id } = req.query
    await db.connect()
    const category = await Department.findById(id)
    if (!category) {
      return res.status(404).json({ message: 'Department not found' })
    }
    res.status(200).json(category)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

handler.use(isAuth, isAdmin)
// Update category by ID
handler.put(async (req, res) => {
  console.log(req.body)

  try {
    const { id } = req.query
    await db.connect()
    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { ...req.body, slug: slugify(req.body.name) },
      {
        new: true
      }
    )
    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' })
    }
    const category = await Department.findById(id)    
    await db.disconnect()

    res.status(200).json(category)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

// Delete category by ID
handler.delete(async (req, res) => {
  try {
    const { id } = req.query
    await db.connect()
    const deletedDepartment = await Department.findByIdAndDelete(id)
    if (!deletedDepartment) {
      return res.status(404).json({ message: 'Department not found' })
    }
    await db.disconnect()
    return res.status(200).json({ message: 'Department deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

// Add Child Department
handler.post(async (req, res) => {
  try {
    const { name } = req.body
    const { id: parentDepartmentId } = req.query

    // Find the parent category by ID
    const parentDepartment = await Department.findById(parentDepartmentId)

    if (!parentDepartment) {
      return res.status(404).json({ message: 'Parent category not found' })
    }

    // Create the child category
    const childDepartment = new Department({ name, slug: slugify(name) })

    // Save the child category
    await childDepartment.save()

    // Add the child category to the parent category's children array
    parentDepartment.children.push(childDepartment._id)
    await parentDepartment.save()

    res.status(201).json(childDepartment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
