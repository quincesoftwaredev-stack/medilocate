// Import necessary modules and models
import BASE_URL from '@/config'
import db from '@/database/connection'
import Category from '@/database/model/Category'
import Symptom from '@/database/model/Symptom'
import { isAdmin, isAuth } from '@/utility'
import axios from 'axios'
import nc from 'next-connect'
import slugify from 'slugify'
const PAGE_SIZE = 100
const handler = nc()


// get all the symptom
handler.get(async (req, res) => {
    try {
        await db.connect()
        // Get the page number from the query parameters, default to 1
        const page = parseInt(req.query.page) || 1

        // Calculate the skip value based on the page number and page size
        const skip = (page - 1) * (req.query.pageSize || PAGE_SIZE)
        // Retrieve total count of products
        const [totalCount, symptoms] = await Promise.all([
            Symptom.countDocuments(),
            Symptom.find().sort({ createdAt: -1 }).skip(skip).limit(PAGE_SIZE).lean()
        ])

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / PAGE_SIZE)

        // await db.disconnect()
        res.json({ page, symptoms, totalPages })
    } catch (error) {
        console.log({ error })
        res.status(500).json({ message: 'Server Error' })
    }
})

handler.use(isAuth, isAdmin)
// Create a new symptom
handler.post(async (req, res) => {
    try {
        await db.connect()
        // const exist = await Symptom.findOne({ name: req.body.name })
        // if (exist) {
        //   return res.status(200).send({
        //     error: 'Already A Cateory Exist With This Name'
        //   })
        // }
        const symptom = await Symptom.create({
            ...req.body,
            slug: slugify(req.body.name)
        })
        await db.disconnect()
        res.status(201).json(symptom)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server Error' })
    }
})


handler.put(async (req, res) => {
    try {
        // Connect to the database
        await db.connect();

        // Fetch symptoms from the external API
        const deleted = await Symptom.deleteMany({})
        const categories = await Category.find({})



        // Create symptoms based on fetched symptoms
        const symptoms = await Promise.all(
            categories.map(async (c) => {
                // Create a symptom using category data
                // Here, we assume that each category object has a 'name' property
                const symptom = await Symptom.create({
                    name: c.name,
                    image: c.image,
                    slug: slugify(c.name) // Use the category name for the slug
                });
                return symptom;
            })
        );

        // Disconnect from the database
        await db.disconnect();

        // Return the created symptoms with a 201 status
        res.status(201).json(symptoms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});





export default handler
