import db from "@/database/connection";
import Prescription from "@/database/model/Prescription";
import nextConnect from "next-connect";
import Orders from "@/database/model/Orders";
const handler = nextConnect();

handler.get(async (req, res) => {
    try {
        await db.connect();

        const {
            id,
            requestCode,
        } = req.query;

        const value =
            id ||
            requestCode;

        if (!value) {
            return res.status(400).json({
                success: false,
                message:
                    "Prescription ID or request code is required.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FIND PRESCRIPTION BY ID OR REQUEST CODE
        |--------------------------------------------------------------------------
        */

        const isMongoId =
            /^[0-9a-fA-F]{24}$/.test(
                value
            );

        const query = {
            $or: [
                {
                    requestCode: value,
                },
            ],
        };

        if (isMongoId) {
            query.$or.push({
                _id: value,
            });
        }

        const prescription =
            await Prescription
                .findOne(query)
                .populate(
                    "order",
                    "trackingNumber status deliveryFee total"
                )
                .lean();

        /*
        |--------------------------------------------------------------------------
        | NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message:
                    "Prescription request not found.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({
            success: true,
            prescription,
        });

    } catch (error) {
        console.error(
            "Get prescription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch prescription.",
        });
    }
});



handler.patch(
    async (
        req,
        res
    ) => {

        try {

            await db.connect();


            /*
            |--------------------------------------------------------------------------
            | PRESCRIPTION ID
            |--------------------------------------------------------------------------
            */

            const {
                id
            } =
                req.query;


            if (
                !id ||
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid prescription ID.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | BODY
            |--------------------------------------------------------------------------
            */

            const {
                items,
                deliveryFee = 0,
                adminNote = "",
            } =
                req.body;


            /*
            |--------------------------------------------------------------------------
            | ITEMS REQUIRED
            |--------------------------------------------------------------------------
            */

            if (
                !Array.isArray(
                    items
                ) ||
                !items.length
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Order must contain at least one medicine.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | DELIVERY FEE
            |--------------------------------------------------------------------------
            */

            const normalizedDeliveryFee =
                Number(
                    deliveryFee
                );


            if (
                !Number.isFinite(
                    normalizedDeliveryFee
                ) ||
                normalizedDeliveryFee <
                    0
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid delivery fee.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | PRESCRIPTION
            |--------------------------------------------------------------------------
            */

            const prescription =
                await Prescription.findById(
                    id
                );


            if (
                !prescription
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Prescription not found.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | CHECK PRESCRIPTION STATUS
            |--------------------------------------------------------------------------
            */

            if (
                [
                    "completed",
                    "cancelled",
                    "rejected",
                ].includes(
                    prescription.status
                )
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "This prescription can no longer be updated.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | ORDER MUST EXIST
            |--------------------------------------------------------------------------
            */

            if (
                !prescription.order
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "No order has been created for this prescription yet.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | FIND ORDER
            |--------------------------------------------------------------------------
            */

            const order =
                await Order.findById(
                    prescription.order
                );


            if (
                !order
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Order not found.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | PROTECT TERMINAL ORDERS
            |--------------------------------------------------------------------------
            |
            | Once delivered / cancelled / failed,
            | medicine contents should not be changed.
            |
            */

            if (
                [
                    "delivered",
                    "cancelled",
                    "failed",
                ].includes(
                    order.status
                )
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            `A ${order.status} order cannot be updated.`,

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | VERIFY ORDER BELONGS TO PRESCRIPTION
            |--------------------------------------------------------------------------
            */

            if (
                order.prescription &&
                String(
                    order.prescription
                ) !==
                    String(
                        prescription._id
                    )
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "Order does not belong to this prescription.",

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | NORMALIZE ITEMS
            |--------------------------------------------------------------------------
            |
            | This also combines duplicate medicines.
            |
            | Example:
            |
            | [
            |   { medicine: A, quantity: 1 },
            |   { medicine: A, quantity: 2 }
            | ]
            |
            | becomes:
            |
            | A → quantity 3
            |
            */

            const itemMap =
                new Map();


            for (
                const item
                of items
            ) {

                const medicineId =
                    String(
                        item?.medicine ||
                        ""
                    );


                /*
                |--------------------------------------------------------------------------
                | VALID MEDICINE ID
                |--------------------------------------------------------------------------
                */

                if (
                    !mongoose.Types.ObjectId.isValid(
                        medicineId
                    )
                ) {

                    return res
                        .status(400)
                        .json({

                            success:
                                false,

                            message:
                                "One or more medicine IDs are invalid.",

                        });

                }


                /*
                |--------------------------------------------------------------------------
                | QUANTITY
                |--------------------------------------------------------------------------
                */

                const quantity =
                    Number(
                        item?.quantity
                    );


                if (
                    !Number.isInteger(
                        quantity
                    ) ||
                    quantity <
                        1
                ) {

                    return res
                        .status(400)
                        .json({

                            success:
                                false,

                            message:
                                "Medicine quantity must be at least 1.",

                        });

                }


                /*
                |--------------------------------------------------------------------------
                | COMBINE DUPLICATES
                |--------------------------------------------------------------------------
                */

                const existingQuantity =
                    itemMap.get(
                        medicineId
                    ) ||
                    0;


                itemMap.set(

                    medicineId,

                    existingQuantity +
                        quantity

                );

            }


            /*
            |--------------------------------------------------------------------------
            | MEDICINE IDS
            |--------------------------------------------------------------------------
            */

            const medicineIds =
                Array.from(
                    itemMap.keys()
                );


            /*
            |--------------------------------------------------------------------------
            | FIND MEDICINES
            |--------------------------------------------------------------------------
            |
            | Price is always obtained from the database.
            |
            | Never trust price from frontend.
            |
            */

            const medicineDocuments =
                await Medicine.find({

                    _id: {
                        $in:
                            medicineIds,
                    },

                    status: {
                        $ne:
                            "inactive",
                    },

                })
                    .select(
                        "_id name genericName strength unit price status"
                    )
                    .lean();


            /*
            |--------------------------------------------------------------------------
            | ENSURE EVERY MEDICINE EXISTS
            |--------------------------------------------------------------------------
            */

            if (
                medicineDocuments.length !==
                medicineIds.length
            ) {

                const foundIds =
                    new Set(

                        medicineDocuments.map(
                            (
                                medicine
                            ) =>
                                String(
                                    medicine._id
                                )
                        )

                    );


                const missingIds =
                    medicineIds.filter(
                        (
                            medicineId
                        ) =>
                            !foundIds.has(
                                medicineId
                            )
                    );


                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "One or more medicines are unavailable.",

                        missingMedicines:
                            missingIds,

                    });

            }


            /*
            |--------------------------------------------------------------------------
            | MEDICINE MAP
            |--------------------------------------------------------------------------
            */

            const medicineMap =
                new Map();


            medicineDocuments.forEach(
                (
                    medicine
                ) => {

                    medicineMap.set(

                        String(
                            medicine._id
                        ),

                        medicine

                    );

                }
            );


            /*
            |--------------------------------------------------------------------------
            | EXISTING PRICES
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            |
            | Existing medicines keep the price they had when
            | the order was originally created.
            |
            | Newly added medicines use the current Medicine.price.
            |
            | Example:
            |
            | Napa old order price = ৳10
            |
            | Medicine database price becomes ৳12
            |
            | Updating Napa quantity keeps ৳10.
            |
            | A newly added medicine uses its current price.
            |
            */

            const existingPriceMap =
                new Map();


            (
                order.items ||
                []
            ).forEach(
                (
                    item
                ) => {

                    existingPriceMap.set(

                        String(
                            item.medicine
                        ),

                        Number(
                            item.unitPrice ||
                            0
                        )

                    );

                }
            );


            /*
            |--------------------------------------------------------------------------
            | BUILD UPDATED ORDER ITEMS
            |--------------------------------------------------------------------------
            */

            const updatedOrderItems =
                medicineIds.map(
                    (
                        medicineId
                    ) => {

                        const medicine =
                            medicineMap.get(
                                medicineId
                            );


                        const quantity =
                            itemMap.get(
                                medicineId
                            );


                        /*
                        |--------------------------------------------------------------------------
                        | UNIT PRICE
                        |--------------------------------------------------------------------------
                        */

                        let unitPrice;


                        if (
                            existingPriceMap.has(
                                medicineId
                            )
                        ) {

                            /*
                             * Existing medicine:
                             *
                             * preserve original price.
                             */

                            unitPrice =
                                Number(
                                    existingPriceMap.get(
                                        medicineId
                                    )
                                );

                        } else {

                            /*
                             * New medicine:
                             *
                             * use current database price.
                             */

                            unitPrice =
                                Number(
                                    medicine.price ||
                                    0
                                );

                        }


                        if (
                            !Number.isFinite(
                                unitPrice
                            ) ||
                            unitPrice <
                                0
                        ) {

                            throw new Error(
                                `Invalid price for medicine ${medicine.name}.`
                            );

                        }


                        return {

                            medicine:
                                medicine._id,

                            quantity,

                            unitPrice,

                        };

                    }
                );


            /*
            |--------------------------------------------------------------------------
            | SUBTOTAL
            |--------------------------------------------------------------------------
            */

            const subtotal =
                updatedOrderItems.reduce(
                    (
                        sum,
                        item
                    ) =>

                        sum +

                        Number(
                            item.unitPrice
                        ) *

                        Number(
                            item.quantity
                        ),

                    0
                );


            /*
            |--------------------------------------------------------------------------
            | TOTAL
            |--------------------------------------------------------------------------
            */

            const total =
                subtotal +
                normalizedDeliveryFee;


            /*
            |--------------------------------------------------------------------------
            | UPDATE ORDER
            |--------------------------------------------------------------------------
            */

            order.items =
                updatedOrderItems;


            order.subtotal =
                subtotal;


            order.deliveryFee =
                normalizedDeliveryFee;


            order.total =
                total;


            order.internalNote =
                String(
                    adminNote ||
                    ""
                ).trim();


            /*
            |--------------------------------------------------------------------------
            | ENSURE PRESCRIPTION REFERENCE
            |--------------------------------------------------------------------------
            */

            if (
                !order.prescription
            ) {

                order.prescription =
                    prescription._id;

            }


            /*
            |--------------------------------------------------------------------------
            | SAVE ORDER
            |--------------------------------------------------------------------------
            */

            await order.save();


            /*
            |--------------------------------------------------------------------------
            | SYNC PRESCRIPTION MEDICINES
            |--------------------------------------------------------------------------
            |
            | Keeps prescription.medicines in sync with the actual order.
            |
            */

            prescription.medicines =
                updatedOrderItems.map(
                    (
                        item
                    ) => {

                        const medicine =
                            medicineMap.get(
                                String(
                                    item.medicine
                                )
                            );


                        return {

                            medicine:
                                item.medicine,

                            prescribedName:
                                medicine?.name ||
                                "Medicine",

                            quantity:
                                item.quantity,

                            status:
                                "identified",

                            note:
                                "",

                        };

                    }
                );


            /*
            |--------------------------------------------------------------------------
            | PRESCRIPTION NOTE
            |--------------------------------------------------------------------------
            */

            prescription.internalNote =
                String(
                    adminNote ||
                    ""
                ).trim();


            /*
            |--------------------------------------------------------------------------
            | KEEP STATUS
            |--------------------------------------------------------------------------
            |
            | An existing order means prescription should remain
            | order_created unless it has moved farther in your workflow.
            |
            */

            if (
                ![
                    "order_created",
                    "completed",
                ].includes(
                    prescription.status
                )
            ) {

                prescription.status =
                    "order_created";

            }


            /*
            |--------------------------------------------------------------------------
            | SAVE PRESCRIPTION
            |--------------------------------------------------------------------------
            */

            await prescription.save();


            /*
            |--------------------------------------------------------------------------
            | POPULATE MEDICINES FOR RESPONSE
            |--------------------------------------------------------------------------
            */

            await order.populate({

                path:
                    "items.medicine",

                select:
                    "name genericName strength unit price",

            });


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res
                .status(200)
                .json({

                    success:
                        true,

                    message:
                        "Order updated successfully.",

                    order: {

                        _id:
                            order._id,

                        trackingNumber:
                            order.trackingNumber,

                        status:
                            order.status,

                        items:
                            order.items,

                        subtotal:
                            order.subtotal,

                        deliveryFee:
                            order.deliveryFee,

                        total:
                            order.total,

                        internalNote:
                            order.internalNote,

                        updatedAt:
                            order.updatedAt,

                    },

                });


        } catch (
            error
        ) {

            console.error(
                "Update prescription order error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        error?.message ||
                        "Failed to update order.",

                });

        }

    }
);

export default handler;