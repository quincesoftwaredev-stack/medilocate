import db from '@/database/connection'
import Medicine from '@/database/model/Medicine'
import { isAuth, isAdmin } from '@/utility'
import nextConnect from 'next-connect'

const handler = nextConnect()


/*
|--------------------------------------------------------------------------
| GET ALL MEDICINES
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| ESCAPE REGEX
|--------------------------------------------------------------------------
*/

const escapeRegex = (
    value
) => {

    return value
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        )

}


/*
|--------------------------------------------------------------------------
| GET ALL MEDICINES
|--------------------------------------------------------------------------
*/

handler.get(

    async (
        req,
        res
    ) => {

        try {

            await db.connect()


            /*
            |--------------------------------------------------------------------------
            | QUERY PARAMETERS
            |--------------------------------------------------------------------------
            */

            const {

                search = '',

                status = 'all',

                category = 'all',

                prescription = 'all',

                stock = 'all',

                page = 1,

                limit = 20

            } = req.query


            /*
            |--------------------------------------------------------------------------
            | BASE QUERY
            |--------------------------------------------------------------------------
            */

            const query = {}


            /*
            |--------------------------------------------------------------------------
            | STATUS
            |--------------------------------------------------------------------------
            */

            if (
                status !== 'all'
            ) {

                query.status =
                    status

            }


            /*
            |--------------------------------------------------------------------------
            | CATEGORY
            |--------------------------------------------------------------------------
            */

            if (
                category !== 'all'
            ) {

                query.category =
                    category

            }


            /*
            |--------------------------------------------------------------------------
            | PRESCRIPTION
            |--------------------------------------------------------------------------
            */

            if (
                prescription ===
                'required'
            ) {

                query.prescriptionRequired =
                    true

            }


            if (
                prescription ===
                'not_required'
            ) {

                query.prescriptionRequired =
                    false

            }


            /*
            |--------------------------------------------------------------------------
            | STOCK
            |--------------------------------------------------------------------------
            */

            if (
                stock ===
                'out_of_stock'
            ) {

                query.stock = {

                    $lte: 0

                }

            }


            if (
                stock ===
                'low_stock'
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
                stock ===
                'in_stock'
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
            |
            | Search:
            |
            | - Brand name
            | - Generic name
            | - Manufacturer
            | - Medicine code
            | - Source slug
            |
            |--------------------------------------------------------------------------
            */

            const searchValue =
                search
                    ?.toString()
                    .trim()


            if (
                searchValue
            ) {

                const regex =
                    new RegExp(
                        escapeRegex(
                            searchValue
                        ),
                        'i'
                    )


                query.$or = [

                    {
                        name:
                            regex
                    },

                    {
                        genericName:
                            regex
                    },

                    {
                        manufacturer:
                            regex
                    },

                    {
                        code:
                            regex
                    },

                    {
                        sourceSlug:
                            regex
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

                    Number(page) ||
                    1,

                    1

                )


            const limitNumber =
                Math.min(

                    Math.max(

                        Number(limit) ||
                        20,

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


            /*
            |--------------------------------------------------------------------------
            | FETCH MEDICINES + TOTAL
            |--------------------------------------------------------------------------
            */

            const [

                medicines,

                total

            ] = await Promise.all([

                Medicine
                    .find(query)

                    .sort({

                        name: 1

                    })

                    .skip(
                        skip
                    )

                    .limit(
                        limitNumber
                    )

                    .lean(),

                Medicine.countDocuments(
                    query
                )

            ])


            /*
            |--------------------------------------------------------------------------
            | GLOBAL STATS
            |--------------------------------------------------------------------------
            |
            | These are independent of the current filters.
            |
            |--------------------------------------------------------------------------
            */

            const [

                totalMedicines,

                activeMedicines,

                prescriptionRequired,

                lowStock,

                outOfStock

            ] = await Promise.all([


                /*
                |----------------------------------------------------------------------
                | TOTAL
                |----------------------------------------------------------------------
                */

                Medicine.countDocuments(),


                /*
                |----------------------------------------------------------------------
                | ACTIVE
                |----------------------------------------------------------------------
                */

                Medicine.countDocuments({

                    status:
                        'active'

                }),


                /*
                |----------------------------------------------------------------------
                | PRESCRIPTION
                |----------------------------------------------------------------------
                */

                Medicine.countDocuments({

                    prescriptionRequired:
                        true

                }),


                /*
                |----------------------------------------------------------------------
                | LOW STOCK
                |----------------------------------------------------------------------
                */

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


                /*
                |----------------------------------------------------------------------
                | OUT OF STOCK
                |----------------------------------------------------------------------
                */

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
                await Medicine
                    .distinct(
                        'category'
                    )


            /*
            |--------------------------------------------------------------------------
            | DOSAGE FORMS
            |--------------------------------------------------------------------------
            */

            const dosageForms =
                await Medicine
                    .distinct(
                        'dosageForm'
                    )


            /*
            |--------------------------------------------------------------------------
            | MANUFACTURERS
            |--------------------------------------------------------------------------
            */

            const manufacturers =
                await Medicine
                    .distinct(
                        'manufacturer'
                    )


            /*
            |--------------------------------------------------------------------------
            | DISCONNECT
            |--------------------------------------------------------------------------
            */

            await db.disconnect()


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res.json({

                success:
                    true,


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


                categories:
                    categories
                        .filter(
                            Boolean
                        )
                        .sort(),


                dosageForms:
                    dosageForms
                        .filter(
                            Boolean
                        )
                        .sort(),


                manufacturers:
                    manufacturers
                        .filter(
                            Boolean
                        )
                        .sort()

            })


        } catch (
            error
        ) {

            console.log(

                'Get medicines error:',

                error

            )


            /*
            |--------------------------------------------------------------------------
            | DISCONNECT
            |--------------------------------------------------------------------------
            */

            try {

                await db.disconnect()

            } catch (
                e
            ) {}


            /*
            |--------------------------------------------------------------------------
            | ERROR
            |--------------------------------------------------------------------------
            */

            return res.status(

                500

            ).json({

                success:
                    false,

                message:
                    'Server Error',

                error:
                    error.message

            })

        }

    }

)



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
| POST - CREATE MEDICINE
|--------------------------------------------------------------------------
*/

handler.post(async (req, res) => {

    // your existing create medicine code

})


export default handler