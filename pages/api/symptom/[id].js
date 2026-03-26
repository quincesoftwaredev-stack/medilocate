// Import necessary modules and models
import db from '@/database/connection'
import Symptom from '@/database/model/Symptom'
import { isAdmin, isAuth } from '@/utility'
import nc from 'next-connect'
import slugify from 'slugify'

const handler = nc()

// Get category by ID
handler.get(async (req, res) => {
  try {
    const { id } = req.query
    await db.connect()
    const category = await Symptom.findById(id)
    if (!category) {
      return res.status(404).json({ message: 'Symptom not found' })
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
    const updatedSymptom = await Symptom.findByIdAndUpdate(
      id,
      { ...req.body, slug: slugify(req.body.name) },
      {
        new: true
      }
    )
    if (!updatedSymptom) {
      return res.status(404).json({ message: 'Symptom not found' })
    }
    const category = await Symptom.findById(id)
    
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
    const deletedSymptom = await Symptom.findByIdAndDelete(id)
    if (!deletedSymptom) {
      return res.status(404).json({ message: 'Symptom not found' })
    }
    await db.disconnect()
    return res.status(200).json({ message: 'Symptom deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

// Add Child Symptom
handler.post(async (req, res) => {
  try {
    const { name } = req.body
    const { id: parentSymptomId } = req.query

    // Find the parent category by ID
    const parentSymptom = await Symptom.findById(parentSymptomId)

    if (!parentSymptom) {
      return res.status(404).json({ message: 'Parent category not found' })
    }

    // Create the child category
    const childSymptom = new Symptom({ name, slug: slugify(name) })

    // Save the child category
    await childSymptom.save()

    // Add the child category to the parent category's children array
    parentSymptom.children.push(childSymptom._id)
    await parentSymptom.save()

    res.status(201).json(childSymptom)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server Error' })
  }
})

export default handler
