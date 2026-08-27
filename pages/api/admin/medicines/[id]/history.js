import db from '@/database/connection'
import MedicineStockTransaction from '@/database/model/MedicineStockTransaction'

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


handler.get(async (req, res) => {
    try {

        await db.connect()


        const {
            id
        } = req.query


        const {
            page = 1,
            limit = 30
        } = req.query


        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            )


        const limitNumber =
            Math.min(
                Math.max(
                    Number(limit) || 30,
                    1
                ),
                100
            )


        const skip =
            (
                pageNumber -
                1
            ) *
            limitNumber


        const transactions =
            await MedicineStockTransaction
                .find({
                    medicine: id
                })
                .populate({
                    path: 'createdBy',
                    select:
                        'name email'
                })
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(
                    limitNumber
                )


        const total =
            await MedicineStockTransaction
                .countDocuments({
                    medicine: id
                })


        await db.disconnect()


        res.json({

            transactions,

            pagination: {
                page:
                    pageNumber,

                limit:
                    limitNumber,

                total,

                pages:
                    Math.ceil(
                        total /
                        limitNumber
                    )
            }

        })


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