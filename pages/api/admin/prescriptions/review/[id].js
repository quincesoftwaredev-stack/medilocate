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

            await db.connect();


            const {
                id,
            } =
                req.query;


            if (
                !id ||
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res
                    .status(
                        400
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Invalid prescription id",

                    });

            }


            /*
             * =========================================================
             * PRESCRIPTION
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
                            "_id",
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


            if (
                !prescription
            ) {

                await db.disconnect();


                return res
                    .status(
                        404
                    )
                    .json({

                        success:
                            false,

                        message:
                            "Prescription not found",

                    });

            }


            /*
             * =========================================================
             * ASSOCIATED MEDICINE IDS
             * =========================================================
             *
             * Existing order:
             * prescription.order.items
             *
             * Before order creation:
             * prescription.medicines
             *
             * =========================================================
             */

            const sourceItems =
                Array.isArray(
                    prescription
                        ?.order
                        ?.items
                ) &&
                    prescription
                        .order
                        .items
                        .length

                    ? prescription
                        .order
                        .items

                    : Array.isArray(
                        prescription
                            ?.medicines
                    )

                        ? prescription
                            .medicines

                        : [];


            const medicineIds =
                sourceItems

                    .map(
                        (
                            item
                        ) => {

                            const medicine =
                                item
                                    ?.medicine ??
                                item
                                    ?.medicineId ??
                                item
                                    ?._id ??
                                item;


                            if (
                                medicine &&
                                typeof medicine ===
                                "object"
                            ) {

                                return medicine
                                    ?._id;

                            }


                            return medicine;

                        }
                    )

                    .filter(
                        (
                            medicineId
                        ) =>
                            medicineId &&
                            mongoose.Types.ObjectId.isValid(
                                medicineId
                            )
                    );


            /*
             * =========================================================
             * ASSOCIATED MEDICINES ONLY
             * =========================================================
             */

            const medicines =
                medicineIds.length

                    ? await Medicine

                        .find({

                            _id: {

                                $in:
                                    medicineIds,

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

                        .lean()

                    : [];


            await db.disconnect();


            /*
             * =========================================================
             * RESPONSE
             * =========================================================
             */

            return res
                .status(
                    200
                )
                .json({

                    success:
                        true,

                    prescription,

                    medicines,

                });


        } catch (
            error
        ) {

            console.error(
                "Prescription review API error:",
                error
            );


            try {

                await db.disconnect();

            } catch (
                e
            ) {

            }


            return res
                .status(
                    500
                )
                .json({

                    success:
                        false,

                    message:
                        "Server Error",

                });

        }

    }
);


export default handler;