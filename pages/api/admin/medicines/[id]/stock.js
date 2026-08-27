import db from '@/database/connection'
import Medicine from '@/database/model/Medicine'
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


handler.post(async (req, res) => {
    try {

        await db.connect()


        const {
            id
        } = req.query


        const {
            type = 'purchase',
            quantity,
            reason = ''
        } = req.body


        const amount =
            Number(quantity)


        if (
            !Number.isInteger(
                amount
            ) ||
            amount <= 0
        ) {

            return res.status(400).json({
                message:
                    'Quantity must be a positive integer'
            })

        }


        const allowedTypes = [
            'purchase',
            'adjustment',
            'return',
            'damaged',
            'expired'
        ]


        if (
            !allowedTypes.includes(
                type
            )
        ) {

            return res.status(400).json({
                message:
                    'Invalid stock transaction type'
            })

        }


        const medicine =
            await Medicine.findById(
                id
            )


        if (!medicine) {

            await db.disconnect()

            return res.status(404).json({
                message:
                    'Medicine not found'
            })

        }


        const previousStock =
            medicine.stock


        let newStock =
            previousStock


        /*
        |--------------------------------------------------------------------------
        | ADD
        |--------------------------------------------------------------------------
        */

        if (
            type ===
                'purchase' ||
            type ===
                'return'
        ) {

            newStock =
                previousStock +
                amount

        }


        /*
        |--------------------------------------------------------------------------
        | REMOVE
        |--------------------------------------------------------------------------
        */

        if (
            type ===
                'damaged' ||
            type ===
                'expired'
        ) {

            newStock =
                previousStock -
                amount


            if (
                newStock < 0
            ) {

                await db.disconnect()

                return res.status(400).json({
                    message:
                        'Insufficient stock'
                })

            }

        }


        /*
        |--------------------------------------------------------------------------
        | ADJUSTMENT
        |--------------------------------------------------------------------------
        |
        | For adjustment we treat quantity as an increase.
        | If later you want exact stock correction,
        | add adjustmentMode: "add" | "remove".
        |
        */

        if (
            type ===
            'adjustment'
        ) {

            const {
                adjustmentMode =
                    'add'
            } = req.body


            if (
                adjustmentMode ===
                'remove'
            ) {

                newStock =
                    previousStock -
                    amount


                if (
                    newStock < 0
                ) {

                    await db.disconnect()

                    return res.status(400).json({
                        message:
                            'Insufficient stock'
                    })

                }

            } else {

                newStock =
                    previousStock +
                    amount

            }

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE MEDICINE
        |--------------------------------------------------------------------------
        */

        medicine.stock =
            newStock


        await medicine.save()


        /*
        |--------------------------------------------------------------------------
        | TRANSACTION
        |--------------------------------------------------------------------------
        */

        const transaction =
            await MedicineStockTransaction
                .create({

                    medicine:
                        medicine._id,

                    type,

                    quantity:
                        amount,

                    previousStock,

                    newStock,

                    reason:
                        reason.trim(),

                    referenceType:
                        'manual'

                })


        await db.disconnect()


        res.json({

            medicine,

            transaction

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