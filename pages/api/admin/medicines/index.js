import db from '@/database/connection'
import Medicine from '@/database/model/Medicine'
import MedicineStockTransaction from '@/database/model/MedicineStockTransaction'

import {
    isAuth,
    isAdmin
} from '@/utility'

import nextConnect from 'next-connect'

const handler = nextConnect()


/*
|--------------------------------------------------------------------------
| GET ALL MEDICINES
|--------------------------------------------------------------------------
*/

handler.get(async (req, res) => {
    try {

        await db.connect()


        const {
            search = '',
            status = 'all',
            category = 'all',
            prescription = 'all',
            stock = 'all',
            page = 1,
            limit = 20
        } = req.query


        const query = {}


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            status !== 'all'
        ) {

            query.status = status

        }


        /*
        |--------------------------------------------------------------------------
        | CATEGORY
        |--------------------------------------------------------------------------
        */

        if (
            category !== 'all'
        ) {

            query.category = category

        }


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        if (
            prescription === 'required'
        ) {

            query.prescriptionRequired = true

        }


        if (
            prescription === 'not_required'
        ) {

            query.prescriptionRequired = false

        }


        /*
        |--------------------------------------------------------------------------
        | STOCK
        |--------------------------------------------------------------------------
        */

        if (
            stock === 'out_of_stock'
        ) {

            query.stock = {
                $lte: 0
            }

        }


        if (
            stock === 'low_stock'
        ) {

            query.$expr = {

                $and: [

                    {
                        $gt: [
                            '$stock',
                            0
                        ]
                    },

                    {
                        $lte: [
                            '$stock',
                            '$reorderLevel'
                        ]
                    }

                ]

            }

        }


        if (
            stock === 'in_stock'
        ) {

            query.$expr = {

                $gt: [
                    '$stock',
                    '$reorderLevel'
                ]

            }

        }


        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if (
            search.trim()
        ) {

            query.$or = [

                {
                    name: {
                        $regex:
                            search.trim(),
                        $options:
                            'i'
                    }
                },

                {
                    genericName: {
                        $regex:
                            search.trim(),
                        $options:
                            'i'
                    }
                },

                {
                    manufacturer: {
                        $regex:
                            search.trim(),
                        $options:
                            'i'
                    }
                },

                {
                    code: {
                        $regex:
                            search.trim(),
                        $options:
                            'i'
                    }
                }

            ]

        }


        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            )


        const limitNumber =
            Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                100
            )


        const skip =
            (
                pageNumber - 1
            ) *
            limitNumber


        /*
        |--------------------------------------------------------------------------
        | FETCH MEDICINES + FILTERED COUNT
        |--------------------------------------------------------------------------
        */

        const [
            medicines,
            total
        ] = await Promise.all([

            Medicine.find(query)
                .sort({
                    createdAt: -1
                })
                .skip(skip)
                .limit(
                    limitNumber
                ),

            Medicine.countDocuments(
                query
            )

        ])


        /*
        |--------------------------------------------------------------------------
        | GLOBAL STATS
        |--------------------------------------------------------------------------
        |
        | These do NOT depend on the current filters.
        |
        */

        const [
            totalMedicines,
            activeMedicines,
            prescriptionRequired,
            lowStock,
            outOfStock
        ] = await Promise.all([

            Medicine.countDocuments(),

            Medicine.countDocuments({
                status: 'active'
            }),

            Medicine.countDocuments({
                prescriptionRequired: true
            }),

            Medicine.countDocuments({

                $expr: {

                    $and: [

                        {
                            $gt: [
                                '$stock',
                                0
                            ]
                        },

                        {
                            $lte: [
                                '$stock',
                                '$reorderLevel'
                            ]
                        }

                    ]

                }

            }),

            Medicine.countDocuments({
                stock: {
                    $lte: 0
                }
            })

        ])


        /*
        |--------------------------------------------------------------------------
        | CATEGORIES
        |--------------------------------------------------------------------------
        */

        const categories =
            await Medicine.distinct(
                'category'
            )


        await db.disconnect()


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        res.json({

            medicines,

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

            },

            stats: {

                total:
                    totalMedicines,

                active:
                    activeMedicines,

                prescriptionRequired,

                lowStock,

                outOfStock

            },

            categories

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
| CREATE MEDICINE
|--------------------------------------------------------------------------
*/

handler.post(async (req, res) => {
    try {

        await db.connect()


        const {
            name,
            genericName,
            strength,
            dosageForm,
            packSize,
            manufacturer,
            category,
            price,
            stock,
            reorderLevel,
            prescriptionRequired,
            description,
            usage,
            warnings,
            image,
            status
        } = req.body


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({
                message:
                    'Medicine name is required'
            })

        }


        if (
            !genericName ||
            !genericName.trim()
        ) {

            return res.status(400).json({
                message:
                    'Generic name is required'
            })

        }


        if (
            price === undefined ||
            Number(price) < 0
        ) {

            return res.status(400).json({
                message:
                    'Valid price is required'
            })

        }


        /*
        |--------------------------------------------------------------------------
        | GENERATE CODE
        |--------------------------------------------------------------------------
        */

        const latest =
            await Medicine.findOne()
                .sort({
                    createdAt: -1
                })
                .select('code')


        let nextCode =
            'MED-10001'


        if (
            latest?.code
        ) {

            const lastNumber =
                Number(
                    latest.code
                        .replace(
                            'MED-',
                            ''
                        )
                )


            if (
                Number.isFinite(
                    lastNumber
                )
            ) {

                nextCode =
                    `MED-${
                        lastNumber + 1
                    }`

            }

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        const medicine =
            await Medicine.create({

                code:
                    nextCode,

                name:
                    name.trim(),

                genericName:
                    genericName.trim(),

                strength:
                    strength?.trim() ||
                    '',

                dosageForm:
                    dosageForm ||
                    'Tablet',

                packSize:
                    packSize?.trim() ||
                    '',

                manufacturer:
                    manufacturer?.trim() ||
                    '',

                category:
                    category ||
                    'Other',

                price:
                    Number(price),

                stock:
                    Math.max(
                        Number(stock) || 0,
                        0
                    ),

                reorderLevel:
                    Math.max(
                        Number(
                            reorderLevel
                        ) || 20,
                        0
                    ),

                prescriptionRequired:
                    Boolean(
                        prescriptionRequired
                    ),

                description:
                    description?.trim() ||
                    '',

                usage:
                    usage?.trim() ||
                    '',

                warnings:
                    warnings?.trim() ||
                    '',

                image:
                    image || {
                        url: '',
                        publicId: ''
                    },

                status:
                    status ===
                    'inactive'
                        ? 'inactive'
                        : 'active'

            })


        /*
        |--------------------------------------------------------------------------
        | INITIAL STOCK TRANSACTION
        |--------------------------------------------------------------------------
        */

        if (
            medicine.stock > 0
        ) {

            await MedicineStockTransaction
                .create({

                    medicine:
                        medicine._id,

                    type:
                        'purchase',

                    quantity:
                        medicine.stock,

                    previousStock:
                        0,

                    newStock:
                        medicine.stock,

                    reason:
                        'Initial stock',

                    referenceType:
                        'system'

                })

        }


        await db.disconnect()


        res.status(201).json(
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