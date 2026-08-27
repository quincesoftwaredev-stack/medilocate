import db from '@/database/connection'

import Medicine from '@/database/model/Medicine'

import {
    isAuth,
    isAdmin
} from '@/utility'

import nextConnect from 'next-connect'

import fs from 'fs'

import path from 'path'


const handler = nextConnect()

handler.use(isAuth, isAdmin)

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| NORMALIZE DOSAGE FORM
|--------------------------------------------------------------------------
*/

const normalizeDosageForm = (
    value
) => {

    if (!value) {

        return 'Other'

    }


    const form =
        value
            .toString()
            .trim()
            .toLowerCase()


    const forms = {

        tablet:
            'Tablet',

        capsule:
            'Capsule',

        syrup:
            'Syrup',

        suspension:
            'Suspension',

        injection:
            'Injection',

        cream:
            'Cream',

        ointment:
            'Ointment',

        drops:
            'Drops',

        inhaler:
            'Inhaler',

        powder:
            'Powder'

    }


    return (
        forms[form] ||
        'Other'
    )

}



/*
|--------------------------------------------------------------------------
| EXTRACT PRICE
|--------------------------------------------------------------------------
|
| Examples:
|
| "100 ml bottle: ৳ 40.12"
| "10 tablets: ৳ 25"
|
| returns:
|
| 40.12
| 25
|
|--------------------------------------------------------------------------
*/

const extractPrice = (
    value
) => {

    if (!value) {

        return 0

    }


    const match =
        value
            .toString()
            .match(
                /৳\s*([\d,]+(?:\.\d+)?)/
            )


    if (!match) {

        return 0

    }


    return Number(
        match[1]
            .replace(
                /,/g,
                ''
            )
    )

}



/*
|--------------------------------------------------------------------------
| EXTRACT PACKAGE SIZE
|--------------------------------------------------------------------------
|
| Example:
|
| "100 ml bottle: ৳ 40.12"
|
| returns:
|
| "100 ml bottle"
|
|--------------------------------------------------------------------------
*/

const extractPackSize = (
    medicine
) => {

    /*
    |--------------------------------------------------------------------------
    | FIRST: Package Size
    |--------------------------------------------------------------------------
    */

    const packageSize =
        medicine[
            'Package Size'
        ]


    if (
        packageSize &&
        packageSize
            .toString()
            .trim()
    ) {

        return packageSize
            .toString()
            .trim()

    }


    /*
    |--------------------------------------------------------------------------
    | FALLBACK: Package Container
    |--------------------------------------------------------------------------
    */

    const container =
        medicine[
            'package container'
        ]


    if (!container) {

        return ''

    }


    /*
    |--------------------------------------------------------------------------
    | Remove price
    |--------------------------------------------------------------------------
    */

    return container
        .toString()
        .split(':')[0]
        .trim()

}



/*
|--------------------------------------------------------------------------
| GENERATE MEDICINE CODE
|--------------------------------------------------------------------------
*/

const generateCode = (
    medicine
) => {

    const slug =
        medicine.slug
            ?.toString()
            .trim()


    if (slug) {

        const cleanSlug =
            slug
                .toUpperCase()
                .replace(
                    /[^A-Z0-9]+/g,
                    '-'
                )
                .replace(
                    /^-|-$/g,
                    ''
                )


        const brandId =
            medicine[
                'brand id'
            ]


        if (
            brandId !== undefined &&
            brandId !== null
        ) {

            return `MED-${brandId}-${cleanSlug}`

        }


        return `MED-${cleanSlug}`

    }


    /*
    |--------------------------------------------------------------------------
    | Fallback
    |--------------------------------------------------------------------------
    */

    const brandId =
        medicine[
            'brand id'
        ]


    if (
        brandId !== undefined &&
        brandId !== null
    ) {

        return `MED-${brandId}`

    }


    return `MED-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`

}



/*
|--------------------------------------------------------------------------
| TRANSFORM MEDICINE
|--------------------------------------------------------------------------
*/

const transformMedicine = (
    medicine
) => {

    return {

        /*
        |--------------------------------------------------------------------------
        | CODE
        |--------------------------------------------------------------------------
        */

        code:
            generateCode(
                medicine
            ),


        /*
        |--------------------------------------------------------------------------
        | SOURCE INFORMATION
        |--------------------------------------------------------------------------
        */

        sourceBrandId:
            medicine[
                'brand id'
            ] !== undefined &&
            medicine[
                'brand id'
            ] !== null
                ? Number(
                    medicine[
                        'brand id'
                    ]
                )
                : null,


        sourceSlug:
            medicine.slug
                ?.toString()
                .trim() ||
            '',


        medicineType:
            medicine.type
                ?.toString()
                .trim() ||
            '',


        /*
        |--------------------------------------------------------------------------
        | BASIC INFORMATION
        |--------------------------------------------------------------------------
        */

        name:
            medicine[
                'brand name'
            ]
                ?.toString()
                .trim() ||
            'Unknown Medicine',


        genericName:
            medicine.generic
                ?.toString()
                .trim() ||
            'Unknown',


        strength:
            medicine.strength
                ?.toString()
                .trim() ||
            '',


        dosageForm:
            normalizeDosageForm(
                medicine[
                    'dosage form'
                ]
            ),


        packSize:
            extractPackSize(
                medicine
            ),


        manufacturer:
            medicine.manufacturer
                ?.toString()
                .trim() ||
            '',


        /*
        |--------------------------------------------------------------------------
        | CATEGORY
        |--------------------------------------------------------------------------
        */

        category:
            'Other',


        /*
        |--------------------------------------------------------------------------
        | PRICE
        |--------------------------------------------------------------------------
        */

        price:
            extractPrice(
                medicine[
                    'package container'
                ]
            ),


        /*
        |--------------------------------------------------------------------------
        | INVENTORY
        |--------------------------------------------------------------------------
        */

        stock:
            0,


        reorderLevel:
            20,


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        prescriptionRequired:
            false,


        /*
        |--------------------------------------------------------------------------
        | PRODUCT INFORMATION
        |--------------------------------------------------------------------------
        */

        description:
            '',


        usage:
            '',


        warnings:
            '',


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        image: {

            url:
                '',

            publicId:
                ''

        },


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        status:
            'active',


        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        */

        createdBy:
            null,


        updatedBy:
            null

    }

}



/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| IMPORT MEDICINES FROM:
|
| /data/medicines.json
|--------------------------------------------------------------------------
*/

handler.get(

    // isAuth,
    // isAdmin,

    async (
        req,
        res
    ) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | CONNECT DATABASE
            |--------------------------------------------------------------------------
            */

            await db.connect()


            /*
            |--------------------------------------------------------------------------
            | JSON FILE PATH
            |--------------------------------------------------------------------------
            */

            const filePath =
                path.join(
                    process.cwd(),
                    'data',
                    'medicines.json'
                )


            /*
            |--------------------------------------------------------------------------
            | CHECK FILE
            |--------------------------------------------------------------------------
            */

            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                await db.disconnect()


                return res.status(
                    404
                ).json({

                    message:
                        'medicines.json not found.',

                    path:
                        filePath

                })

            }


            /*
            |--------------------------------------------------------------------------
            | READ JSON FILE
            |--------------------------------------------------------------------------
            */

            const file =
                fs.readFileSync(
                    filePath,
                    'utf-8'
                )


            /*
            |--------------------------------------------------------------------------
            | PARSE JSON
            |--------------------------------------------------------------------------
            */

            let medicines


            try {

                medicines =
                    JSON.parse(
                        file
                    )

            } catch (
                error
            ) {

                await db.disconnect()


                return res.status(
                    400
                ).json({

                    message:
                        'Invalid JSON file.',

                    error:
                        error.message

                })

            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE ARRAY
            |--------------------------------------------------------------------------
            */

            if (
                !Array.isArray(
                    medicines
                )
            ) {

                await db.disconnect()


                return res.status(
                    400
                ).json({

                    message:
                        'medicines.json must contain an array.'

                })

            }


            /*
            |--------------------------------------------------------------------------
            | EMPTY FILE
            |--------------------------------------------------------------------------
            */

            if (
                medicines.length === 0
            ) {

                await db.disconnect()


                return res.status(
                    400
                ).json({

                    message:
                        'medicines.json is empty.'

                })

            }


            /*
            |--------------------------------------------------------------------------
            | TRANSFORM
            |--------------------------------------------------------------------------
            */

            const transformed =
                medicines.map(
                    transformMedicine
                )


            /*
            |--------------------------------------------------------------------------
            | VALID MEDICINES
            |--------------------------------------------------------------------------
            */

            const validMedicines =
                transformed.filter(
                    medicine => {

                        return (

                            medicine.code &&

                            medicine.name &&

                            medicine.genericName &&

                            medicine.sourceSlug

                        )

                    }
                )


            /*
            |--------------------------------------------------------------------------
            | INVALID COUNT
            |--------------------------------------------------------------------------
            */

            const invalid =
                transformed.length -
                validMedicines.length


            /*
            |--------------------------------------------------------------------------
            | BATCH SIZE
            |--------------------------------------------------------------------------
            */

            const BATCH_SIZE =
                500


            /*
            |--------------------------------------------------------------------------
            | COUNTERS
            |--------------------------------------------------------------------------
            */

            let inserted = 0

            let existing = 0

            let modified = 0


            /*
            |--------------------------------------------------------------------------
            | DUPLICATE SOURCE SLUGS
            |--------------------------------------------------------------------------
            |
            | Prevent duplicate operations inside
            | the same JSON file.
            |--------------------------------------------------------------------------
            */

            const uniqueMedicines =
                new Map()


            validMedicines.forEach(
                medicine => {

                    uniqueMedicines.set(
                        medicine.sourceSlug,
                        medicine
                    )

                }
            )


            const uniqueList =
                Array.from(
                    uniqueMedicines.values()
                )


            /*
            |--------------------------------------------------------------------------
            | PROCESS IN BATCHES
            |--------------------------------------------------------------------------
            */

            for (
                let i = 0;
                i < uniqueList.length;
                i += BATCH_SIZE
            ) {

                const batch =
                    uniqueList.slice(
                        i,
                        i + BATCH_SIZE
                    )


                /*
                |--------------------------------------------------------------------------
                | BULK OPERATIONS
                |--------------------------------------------------------------------------
                */

                const operations =
                    batch.map(
                        medicine => ({

                            updateOne: {

                                /*
                                |--------------------------------------------------------------------------
                                | UNIQUE SOURCE IDENTIFIER
                                |--------------------------------------------------------------------------
                                */

                                filter: {

                                    sourceSlug:
                                        medicine.sourceSlug

                                },


                                /*
                                |--------------------------------------------------------------------------
                                | INSERT ONLY
                                |--------------------------------------------------------------------------
                                |
                                | Existing medicine will NOT
                                | have its stock, price, etc.
                                | overwritten.
                                |--------------------------------------------------------------------------
                                */

                                update: {

                                    $setOnInsert:
                                        medicine

                                },


                                upsert:
                                    true

                            }

                        })
                    )


                /*
                |--------------------------------------------------------------------------
                | EXECUTE BULK WRITE
                |--------------------------------------------------------------------------
                */

                const result =
                    await Medicine.bulkWrite(
                        operations,
                        {
                            ordered:
                                false
                        }
                    )


                /*
                |--------------------------------------------------------------------------
                | UPDATE COUNTERS
                |--------------------------------------------------------------------------
                */

                inserted +=
                    result.upsertedCount ||
                    0


                existing +=
                    result.matchedCount ||
                    0


                modified +=
                    result.modifiedCount ||
                    0

            }


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

                message:
                    'Medicines imported successfully.',


                file:
                    'data/medicines.json',


                totalReceived:
                    medicines.length,


                totalValid:
                    validMedicines.length,


                unique:
                    uniqueList.length,


                invalid,


                inserted,


                existing,


                modified

            })

        } catch (
            error
        ) {

            console.log(
                'Medicine import error:',
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
            | ERROR RESPONSE
            |--------------------------------------------------------------------------
            */

            return res.status(
                500
            ).json({

                message:
                    'Server Error',

                error:
                    error.message

            })

        }

    }

)


export default handler