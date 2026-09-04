import nextConnect from "next-connect";
import fs from "fs";
import path from "path";

import db from "@/utils/db";
import Medicine from "@/models/Medicine";


const handler = nextConnect({

    onError(error, req, res) {

        console.error(
            "❌ Update medicine pricing error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Internal server error",

        });

    },


    onNoMatch(req, res) {

        res.status(405).json({

            success: false,

            message: `Method ${req.method} not allowed`,

        });

    },

});


/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const BATCH_SIZE = 500;


/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| POST:
|
| /api/medicine/update-unit-price
|
| Dry run:
|
| /api/medicine/update-unit-price?dryRun=true
|
*/


handler.post(

    async (req, res) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | CONNECT DATABASE
            |--------------------------------------------------------------------------
            */

            await db.connect();


            /*
            |--------------------------------------------------------------------------
            | OPTIONAL SECURITY
            |--------------------------------------------------------------------------
            */

            const secret =
                req.headers[
                    "x-admin-secret"
                ];


            if (
                process.env
                    .MEDICINE_IMPORT_SECRET &&
                secret !==
                    process.env
                        .MEDICINE_IMPORT_SECRET
            ) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Unauthorized",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | DRY RUN
            |--------------------------------------------------------------------------
            */

            const dryRun =
                req.query.dryRun ===
                    "true" ||
                req.query.dryRun ===
                    "1";


            /*
            |--------------------------------------------------------------------------
            | JSON FILE
            |--------------------------------------------------------------------------
            |
            | Put file here:
            |
            | /data/medicines_single_piece_under_15.json
            |
            */

            const filePath =
                path.join(

                    process.cwd(),

                    "data",

                    "medicines_single_piece_under_15.json"

                );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Medicine JSON file not found",

                        filePath,

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | READ JSON
            |--------------------------------------------------------------------------
            */

            const fileContent =
                fs.readFileSync(
                    filePath,
                    "utf8"
                );


            const medicines =
                JSON.parse(
                    fileContent
                );


            if (
                !Array.isArray(
                    medicines
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Medicine JSON must be an array",

                    });

            }


            console.log(
                "\n========================================"
            );

            console.log(
                "💊 MEDICINE UNIT PRICE UPDATE"
            );

            console.log(
                "========================================"
            );

            console.log(
                `📦 JSON records: ${medicines.length}`
            );

            console.log(
                `🧪 Dry run: ${dryRun}`
            );


            /*
            |--------------------------------------------------------------------------
            | PREPARE DATA
            |--------------------------------------------------------------------------
            */

            const validMedicines = [];

            const invalidMedicines =
                [];


            for (
                const medicine
                of medicines
            ) {

                /*
                |--------------------------------------------------------------------------
                | CODE
                |--------------------------------------------------------------------------
                */

                const code =
                    String(
                        medicine?.code ||
                            ""
                    ).trim();


                if (!code) {

                    invalidMedicines.push({

                        code: null,

                        reason:
                            "Missing medicine code",

                    });


                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | PRICE
                |--------------------------------------------------------------------------
                */

                const price =
                    Number(
                        medicine.price
                    );


                if (
                    !Number.isFinite(
                        price
                    ) ||
                    price < 0
                ) {

                    invalidMedicines.push({

                        code,

                        reason:
                            "Invalid price",

                        price:
                            medicine.price,

                    });


                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | PACK SIZE
                |--------------------------------------------------------------------------
                */

                const packSize =
                    String(
                        medicine
                            ?.packSize ||
                            ""
                    ).trim();


                if (!packSize) {

                    invalidMedicines.push({

                        code,

                        reason:
                            "Missing packSize",

                    });


                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | PRICE UNIT
                |--------------------------------------------------------------------------
                */

                const priceUnit =
                    String(
                        medicine
                            ?.priceUnit ||
                            ""
                    )
                        .trim()
                        .toLowerCase();


                if (!priceUnit) {

                    invalidMedicines.push({

                        code,

                        reason:
                            "Missing priceUnit",

                    });


                    continue;

                }


                validMedicines.push({

                    code,

                    price:
                        Math.round(
                            price *
                                100
                        ) / 100,

                    packSize,

                    priceUnit,

                });

            }


            console.log(
                `✅ Valid: ${validMedicines.length}`
            );

            console.log(
                `⚠️ Invalid: ${invalidMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | FIND EXISTING MEDICINES
            |--------------------------------------------------------------------------
            */

            const codes =
                validMedicines.map(
                    (medicine) =>
                        medicine.code
                );


            const existingMedicines =
                await Medicine.find(

                    {

                        code: {
                            $in: codes,
                        },

                    },

                    {

                        code: 1,

                        price: 1,

                        packSize: 1,

                        priceUnit: 1,

                    }

                ).lean();


            console.log(
                `🔎 Found in database: ${existingMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | CREATE LOOKUP MAP
            |--------------------------------------------------------------------------
            */

            const medicineMap =
                new Map();


            for (
                const medicine
                of existingMedicines
            ) {

                medicineMap.set(

                    medicine.code,

                    medicine

                );

            }


            /*
            |--------------------------------------------------------------------------
            | CHECK CHANGES
            |--------------------------------------------------------------------------
            */

            const medicinesToUpdate =
                [];

            const unchangedMedicines =
                [];

            const notFoundMedicines =
                [];


            for (
                const medicine
                of validMedicines
            ) {

                const existing =
                    medicineMap.get(
                        medicine.code
                    );


                /*
                |--------------------------------------------------------------------------
                | NOT FOUND
                |--------------------------------------------------------------------------
                */

                if (!existing) {

                    notFoundMedicines.push(
                        medicine.code
                    );


                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | COMPARE
                |--------------------------------------------------------------------------
                */

                const existingPrice =
                    Number(
                        existing.price
                    );


                const existingPackSize =
                    String(
                        existing.packSize ||
                            ""
                    ).trim();


                const existingPriceUnit =
                    String(
                        existing.priceUnit ||
                            ""
                    )
                        .trim()
                        .toLowerCase();


                const priceChanged =
                    existingPrice !==
                    medicine.price;


                const packChanged =
                    existingPackSize !==
                    medicine.packSize;


                const unitChanged =
                    existingPriceUnit !==
                    medicine.priceUnit;


                if (
                    priceChanged ||
                    packChanged ||
                    unitChanged
                ) {

                    medicinesToUpdate.push(
                        medicine
                    );

                } else {

                    unchangedMedicines.push(
                        medicine.code
                    );

                }

            }


            console.log(
                `🔄 Need update: ${medicinesToUpdate.length}`
            );

            console.log(
                `✔️ Already updated: ${unchangedMedicines.length}`
            );

            console.log(
                `❌ Not found: ${notFoundMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | DRY RUN
            |--------------------------------------------------------------------------
            */

            if (dryRun) {

                return res
                    .status(200)
                    .json({

                        success: true,

                        dryRun: true,

                        message:
                            "Dry run completed. Database was not modified.",

                        statistics: {

                            total:
                                medicines.length,

                            valid:
                                validMedicines.length,

                            invalid:
                                invalidMedicines.length,

                            found:
                                existingMedicines.length,

                            needUpdate:
                                medicinesToUpdate.length,

                            unchanged:
                                unchangedMedicines.length,

                            notFound:
                                notFoundMedicines.length,

                        },


                        updateExamples:
                            medicinesToUpdate.slice(
                                0,
                                20
                            ),


                        invalidExamples:
                            invalidMedicines.slice(
                                0,
                                20
                            ),


                        notFoundExamples:
                            notFoundMedicines.slice(
                                0,
                                20
                            ),

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | BULK UPDATE
            |--------------------------------------------------------------------------
            */

            let matchedCount = 0;

            let modifiedCount = 0;

            let batchNumber = 0;


            for (
                let i = 0;
                i <
                medicinesToUpdate.length;
                i += BATCH_SIZE
            ) {

                batchNumber++;


                const batch =
                    medicinesToUpdate.slice(

                        i,

                        i +
                            BATCH_SIZE

                    );


                const operations =
                    batch.map(
                        (
                            medicine
                        ) => ({

                            updateOne: {

                                filter: {

                                    code:
                                        medicine.code,

                                },


                                update: {

                                    $set: {

                                        price:
                                            medicine.price,

                                        packSize:
                                            medicine.packSize,

                                        priceUnit:
                                            medicine.priceUnit,

                                    },

                                },

                            },

                        })
                    );


                const result =
                    await Medicine.bulkWrite(

                        operations,

                        {

                            ordered: false,

                        }

                    );


                matchedCount +=
                    result.matchedCount ||
                    0;


                modifiedCount +=
                    result.modifiedCount ||
                    0;


                console.log(
                    "\n----------------------------------------"
                );

                console.log(
                    `📦 Batch ${batchNumber}`
                );

                console.log(
                    `📊 Records: ${batch.length}`
                );

                console.log(
                    `🔎 Matched: ${
                        result.matchedCount ||
                        0
                    }`
                );

                console.log(
                    `✏️ Modified: ${
                        result.modifiedCount ||
                        0
                    }`
                );

            }


            /*
            |--------------------------------------------------------------------------
            | FINAL LOG
            |--------------------------------------------------------------------------
            */

            console.log(
                "\n========================================"
            );

            console.log(
                "🎉 UPDATE COMPLETED"
            );

            console.log(
                "========================================"
            );

            console.log(
                `📦 Total JSON: ${medicines.length}`
            );

            console.log(
                `🔄 Requested update: ${medicinesToUpdate.length}`
            );

            console.log(
                `🔎 Matched: ${matchedCount}`
            );

            console.log(
                `✅ Modified: ${modifiedCount}`
            );

            console.log(
                `✔️ Already correct: ${unchangedMedicines.length}`
            );

            console.log(
                `❌ Not found: ${notFoundMedicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Medicine unit pricing updated successfully",

                    statistics: {

                        total:
                            medicines.length,

                        valid:
                            validMedicines.length,

                        invalid:
                            invalidMedicines.length,

                        found:
                            existingMedicines.length,

                        requestedUpdate:
                            medicinesToUpdate.length,

                        matched:
                            matchedCount,

                        modified:
                            modifiedCount,

                        alreadyUpdated:
                            unchangedMedicines.length,

                        notFound:
                            notFoundMedicines.length,

                    },


                    invalidExamples:
                        invalidMedicines.slice(
                            0,
                            20
                        ),


                    notFoundExamples:
                        notFoundMedicines.slice(
                            0,
                            20
                        ),

                });


        } catch (error) {

            console.error(
                "❌ Medicine pricing update failed:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Medicine pricing update failed",

                });

        }

    }

);


export default handler;