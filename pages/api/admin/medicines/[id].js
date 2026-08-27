import db from '@/database/connection'
import Medicine from '@/database/model/Medicine'

import {
    isAuth,
    isAdmin
} from '@/utility'

import {
    deleteFileFromUrl
} from '@/utility/helper'

import nextConnect from 'next-connect'

const handler = nextConnect()


/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

handler.get(async (req, res) => {
    try {

        await db.connect()


        const {
            id
        } = req.query


        const medicine =
            await Medicine.findOne({
                _id: id
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
            message:
                'Server Error'
        })

    }
})


/*
|--------------------------------------------------------------------------
| ADMIN AUTH
|--------------------------------------------------------------------------
*/

handler.use(
    isAuth,
    isAdmin
)


/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

handler.put(async (req, res) => {
    try {

        await db.connect()


        const {
            id
        } = req.query


        const oldMedicine =
            await Medicine.findById(
                id
            )


        if (!oldMedicine) {

            await db.disconnect()

            return res.status(404).json({
                message:
                    'Medicine not found'
            })

        }


        const {
            name,
            genericName,
            strength,
            dosageForm,
            packSize,
            manufacturer,
            category,
            price,
            reorderLevel,
            prescriptionRequired,
            description,
            usage,
            warnings,
            image,
            status
        } = req.body


        const medicine =
            await Medicine.findByIdAndUpdate(
                id,
                {

                    name,

                    genericName,

                    strength,

                    dosageForm,

                    packSize,

                    manufacturer,

                    category,

                    price,

                    reorderLevel,

                    prescriptionRequired,

                    description,

                    usage,

                    warnings,

                    image,

                    status

                },
                {
                    new: true,
                    runValidators: true
                }
            )


        /*
        |--------------------------------------------------------------------------
        | DELETE OLD IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            oldMedicine.image?.url &&
            image?.url &&
            oldMedicine.image.url !==
                image.url
        ) {

            try {

                await deleteFileFromUrl(
                    oldMedicine
                        .image
                        .url
                )

            } catch (error) {

                console.error(
                    'Error deleting old medicine image:',
                    error
                )

            }

        }


        await db.disconnect()


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


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

handler.delete(async (req, res) => {
    try {

        await db.connect()


        const {
            id
        } = req.query


        const medicine =
            await Medicine.findByIdAndDelete(
                id
            )


        if (!medicine) {

            await db.disconnect()

            return res.status(404).json({
                message:
                    'Medicine not found'
            })

        }


        /*
        |--------------------------------------------------------------------------
        | DELETE IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            medicine.image?.url
        ) {

            try {

                await deleteFileFromUrl(
                    medicine.image.url
                )

            } catch (error) {

                console.error(
                    `Error deleting file at ${medicine.image.url}:`,
                    error
                )

            }

        }


        await db.disconnect()


        res.status(204).end()


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