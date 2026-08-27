import db from '@/database/connection'
import Medicine from '@/database/model/Medicine'
import nextConnect from 'next-connect'

const handler = nextConnect()

handler.get(async (req, res) => {
    try {

        await db.connect()

        const {
            id
        } = req.query


        const medicine =
            await Medicine.findOne({
                _id: id,
                status: 'active'
            })


        await db.disconnect()


        if (!medicine) {

            return res.status(404).json({
                message:
                    'Medicine not found'
            })

        }


        res.json(
            medicine
        )


    } catch (error) {

        console.log(error)

        try {
            await db.disconnect()
        } catch (e) {}

        res.status(500).json({
            message: 'Server Error'
        })

    }
})

export default handler