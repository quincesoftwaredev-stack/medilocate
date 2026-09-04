import nextConnect from "next-connect";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import db from "@/database/connection";
import Medicine from "@/database/model/Medicine";


const handler = nextConnect();


handler.get(

    async (req, res) => {

        let session = null;


        try {

            /*
            |--------------------------------------------------------------------------
            | CONNECT DATABASE
            |--------------------------------------------------------------------------
            */

            await db.connect();


            /*
            |--------------------------------------------------------------------------
            | READ JSON
            |--------------------------------------------------------------------------
            */

            const filePath = path.join(

                process.cwd(),

                "data",

                "medicines_single_piece_under_15.json"

            );


            if (!fs.existsSync(filePath)) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Medicine JSON file not found",

                });

            }


            const rawData =
                fs.readFileSync(
                    filePath,
                    "utf8"
                );


            const medicines =
                JSON.parse(
                    rawData
                );


            /*
            |--------------------------------------------------------------------------
            | VALIDATE ARRAY
            |--------------------------------------------------------------------------
            */

            if (!Array.isArray(medicines)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Medicine JSON must be an array",

                });

            }


            if (medicines.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Medicine JSON is empty. Database was NOT deleted.",

                });

            }


            console.log(
                "\n======================================"
            );

            console.log(
                "💊 RESET MEDICINE DATABASE"
            );

            console.log(
                "======================================"
            );

            console.log(
                `📦 JSON medicines: ${medicines.length}`
            );


            /*
            |--------------------------------------------------------------------------
            | VALIDATE RECORDS BEFORE DELETING DATABASE
            |--------------------------------------------------------------------------
            */

            const invalidRecords = [];

            const seenIds = new Set();

            const seenCodes = new Set();


            for (
                let i = 0;
                i < medicines.length;
                i++
            ) {

                const medicine =
                    medicines[i];


                /*
                |--------------------------------------------------------------------------
                | _ID
                |--------------------------------------------------------------------------
                */

                if (
                    !medicine._id ||
                    !mongoose.Types.ObjectId.isValid(
                        medicine._id
                    )
                ) {

                    invalidRecords.push({

                        index: i,

                        _id:
                            medicine._id,

                        code:
                            medicine.code,

                        reason:
                            "Invalid _id",

                    });


                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | DUPLICATE _ID
                |--------------------------------------------------------------------------
                */

                const id =
                    String(
                        medicine._id
                    );


                if (
                    seenIds.has(id)
                ) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        code:
                            medicine.code,

                        reason:
                            "Duplicate _id in JSON",

                    });


                    continue;

                }


                seenIds.add(id);


                /*
                |--------------------------------------------------------------------------
                | CODE
                |--------------------------------------------------------------------------
                */

                if (!medicine.code) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        reason:
                            "Missing code",

                    });


                    continue;

                }


                const code =
                    String(
                        medicine.code
                    ).trim();


                /*
                |--------------------------------------------------------------------------
                | DUPLICATE CODE
                |--------------------------------------------------------------------------
                */

                if (
                    seenCodes.has(code)
                ) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        code,

                        reason:
                            "Duplicate code in JSON",

                    });


                    continue;

                }


                seenCodes.add(code);


                /*
                |--------------------------------------------------------------------------
                | REQUIRED FIELDS
                |--------------------------------------------------------------------------
                */

                if (!medicine.name) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        code,

                        reason:
                            "Missing name",

                    });

                }


                if (
                    !medicine.genericName
                ) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        code,

                        reason:
                            "Missing genericName",

                    });

                }


                const price =
                    Number(
                        medicine.price
                    );


                if (
                    !Number.isFinite(price) ||
                    price < 0
                ) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        code,

                        reason:
                            "Invalid price",

                        price:
                            medicine.price,

                    });

                }


                if (
                    !medicine.priceUnit
                ) {

                    invalidRecords.push({

                        index: i,

                        _id: id,

                        code,

                        reason:
                            "Missing priceUnit",

                    });

                }

            }


            /*
            |--------------------------------------------------------------------------
            | STOP BEFORE DELETE IF JSON HAS ERRORS
            |--------------------------------------------------------------------------
            */

            if (
                invalidRecords.length >
                0
            ) {

                console.log(
                    `❌ Validation failed: ${invalidRecords.length}`
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "JSON validation failed. Nothing was deleted.",

                    total:
                        medicines.length,

                    invalid:
                        invalidRecords.length,

                    examples:
                        invalidRecords.slice(
                            0,
                            50
                        ),

                });

            }


            console.log(
                "✅ JSON validation passed"
            );


            /*
            |--------------------------------------------------------------------------
            | PREPARE DOCUMENTS
            |--------------------------------------------------------------------------
            */

            const documents =
                medicines.map(
                    (medicine) => {

                        /*
                        |--------------------------------------------------------------------------
                        | REMOVE MONGOOSE VERSION
                        |--------------------------------------------------------------------------
                        */

                        const {
                            __v,
                            ...data
                        } = medicine;


                        /*
                        |--------------------------------------------------------------------------
                        | FORCE OBJECT ID
                        |--------------------------------------------------------------------------
                        */

                        return {

                            ...data,

                            _id:
                                new mongoose
                                    .Types
                                    .ObjectId(
                                        medicine._id
                                    ),

                        };

                    }
                );


            /*
            |--------------------------------------------------------------------------
            | START TRANSACTION
            |--------------------------------------------------------------------------
            |
            | Important:
            |
            | If insertMany fails after deleteMany,
            | transaction.abortTransaction()
            | restores the old collection.
            |
            */

            session =
                await mongoose.startSession();


            session.startTransaction();


            /*
            |--------------------------------------------------------------------------
            | COUNT OLD DATA
            |--------------------------------------------------------------------------
            */

            const oldCount =
                await Medicine.countDocuments(
                    {},
                    {
                        session,
                    }
                );


            console.log(
                `📊 Existing medicines: ${oldCount}`
            );


            /*
            |--------------------------------------------------------------------------
            | DELETE ALL EXISTING MEDICINES
            |--------------------------------------------------------------------------
            */

            const deleteResult =
                await Medicine.deleteMany(
                    {},
                    {
                        session,
                    }
                );


            console.log(
                `🗑️ Deleted: ${deleteResult.deletedCount}`
            );


            /*
            |--------------------------------------------------------------------------
            | INSERT NEW JSON
            |--------------------------------------------------------------------------
            */

            console.log(
                `📥 Inserting ${documents.length} medicines...`
            );


            const inserted =
                await Medicine.insertMany(

                    documents,

                    {

                        session,

                        ordered: true,

                    }

                );


            /*
            |--------------------------------------------------------------------------
            | VERIFY
            |--------------------------------------------------------------------------
            */

            const finalCount =
                await Medicine.countDocuments(
                    {},
                    {
                        session,
                    }
                );


            if (
                finalCount !==
                documents.length
            ) {

                throw new Error(

                    `Insert verification failed. Expected ${documents.length}, found ${finalCount}.`

                );

            }


            /*
            |--------------------------------------------------------------------------
            | COMMIT
            |--------------------------------------------------------------------------
            */

            await session.commitTransaction();


            console.log(
                "\n======================================"
            );

            console.log(
                "🎉 MEDICINE DATABASE RESET COMPLETE"
            );

            console.log(
                "======================================"
            );

            console.log(
                `🗑️ Old records: ${oldCount}`
            );

            console.log(
                `📥 Inserted: ${inserted.length}`
            );

            console.log(
                `✅ Final count: ${finalCount}`
            );


            return res.status(200).json({

                success: true,

                message:
                    "Medicine database replaced successfully",

                statistics: {

                    oldRecords:
                        oldCount,

                    deleted:
                        deleteResult.deletedCount,

                    inserted:
                        inserted.length,

                    finalRecords:
                        finalCount,

                },

            });


        } catch (error) {

            /*
            |--------------------------------------------------------------------------
            | ROLLBACK
            |--------------------------------------------------------------------------
            */

            if (
                session?.inTransaction()
            ) {

                await session.abortTransaction();


                console.log(
                    "↩️ Transaction rolled back"
                );

            }


            console.error(
                "❌ Medicine reset error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message,

            });


        } finally {

            /*
            |--------------------------------------------------------------------------
            | END SESSION
            |--------------------------------------------------------------------------
            */

            if (session) {

                await session.endSession();

            }

        }

    }

);


export default handler;