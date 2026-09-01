import db from "@/database/connection";

import Prescription from "@/database/model/Prescription";

import Order from "@/database/model/Orders";

import Medicine from "@/database/model/Medicine";

import nextConnect from "next-connect";

import mongoose from "mongoose";


const handler =
    nextConnect();


handler.get(
    async (
        req,
        res
    ) => {

        try {
            console.log(".................")

            await db.connect();


            const {
                id,
            } =
                req.query;


            console.log(
                "=============================="
            );

            console.log(
                "URL ID:",
                id
            );

            console.log(
                "Valid Mongo ID:",
                mongoose.Types.ObjectId.isValid(
                    id
                )
            );


            if (
                !id
            ) {

                return res
                    .status(
                        400
                    )
                    .json({
                        message:
                            "Prescription id is required",
                    });

            }


            /*
             * =========================================================
             * TEST DIRECT PRESCRIPTION LOOKUP
             * =========================================================
             */

            const rawPrescription =
                mongoose.Types.ObjectId.isValid(
                    id
                )
                    ? await Prescription
                        .findOne({
                            _id:
                                id,
                        })
                        .lean()

                    : null;


            console.log(
                "Direct lookup:",
                rawPrescription
            );


            /*
             * =========================================================
             * SHOW SOME EXISTING IDS
             * =========================================================
             */

            const existingPrescriptions =
                await Prescription

                    .find({})

                    .select(
                        "_id"
                    )

                    .limit(
                        5
                    )

                    .lean();


            console.log(
                "Existing IDs:",
                existingPrescriptions.map(
                    (item) =>
                        String(
                            item._id
                        )
                )
            );


            if (
                !rawPrescription
            ) {

                await db.disconnect();


                return res
                    .status(
                        404
                    )
                    .json({

                        message:
                            "Prescription not found",

                        requestedId:
                            id,

                        existingIds:
                            existingPrescriptions.map(
                                (item) =>
                                    String(
                                        item._id
                                    )
                            ),

                    });

            }


            /*
             * =========================================================
             * FULL PRESCRIPTION
             * =========================================================
             */

            const prescription =
                await Prescription

                    .findById(
                        id
                    )

                    .populate(
                        "user",
                        "name phone email"
                    )

                    .populate(
                        "order",

                        [
                            "orderId",
                            "trackingNumber",
                            "status",
                            "items",
                            "subtotal",
                            "deliveryFee",
                            "total",
                            "adminNote",
                            "createdAt",
                        ].join(
                            " "
                        )
                    )

                    .lean();


            /*
             * =========================================================
             * MEDICINES
             * =========================================================
             */

            const medicines =
                await Medicine

                    .find({

                        status: {

                            $ne:
                                "inactive",

                        },

                    })

                    .select(

                        [
                            "name",
                            "genericName",
                            "strength",
                            "unit",
                            "price",
                            "prescriptionRequired",
                            "status",
                        ].join(
                            " "
                        )

                    )

                    .sort({

                        name:
                            1,

                    })

                    .lean();


            await db.disconnect();


            return res
                .status(
                    200
                )
                .json({

                    prescription,

                    medicines,

                });


        } catch (
            error
        ) {

            console.log(
                "Prescription API Error:",
                error
            );


            try {

                await db.disconnect();

            } catch (
                error
            ) {

            }


            return res
                .status(
                    500
                )
                .json({

                    message:
                        "Server Error",

                    error:
                        error.message,

                });

        }

    }
);


export default handler;