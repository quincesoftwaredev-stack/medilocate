import db from '@/database/connection'
import Medicine from '@/database/model/Medicine'

import {
    isAuth,
    isAdmin
} from '@/utility'

import nextConnect from 'next-connect'

const handler = nextConnect()


handler.use(
    isAuth,
    isAdmin
)


handler.put(async (req, res) => {
    try {

        await db.connect()


        const {
            id
        } = req.query


        const {
            status
        } = req.body


        if (
            ![
                'active',
                'inactive'
            ].includes(
                status
            )
        ) {

            return res.status(400).json({
                message:
                    'Invalid medicine status'
            })

        }


        const medicine =
            await Medicine.findByIdAndUpdate(
                id,
                {
                    status
                },
                {
                    new: true
                }
            )


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
            message:
                'Server Error'
        })

    }
})


export default handler