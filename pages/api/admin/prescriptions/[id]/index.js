import db from "@/database/connection";
import Prescription from "@/database/model/Prescription";
import Order from "@/database/model/Order";
import Medicine from "@/database/model/Medicine";
import nextConnect from "next-connect";

const handler = nextConnect();


handler.post(async (req, res) => {

    try {

        await db.connect();


        const {
            id,
        } = req.query;


        const {
            items,
            deliveryFee = 0,
            adminNote = "",
        } = req.body;


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!id) {

            return res.status(400).json({
                success: false,
                message:
                    "Prescription ID is required.",
            });

        }


        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one medicine is required.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | GET PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        const prescription =
            await Prescription.findById(id);


        if (!prescription) {

            return res.status(404).json({
                success: false,
                message:
                    "Prescription not found.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | PREVENT DUPLICATE ORDER
        |--------------------------------------------------------------------------
        */

        if (
            prescription.status ===
                "order_created" ||
            prescription.status ===
                "completed"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "An order has already been created for this prescription.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE MEDICINES
        |--------------------------------------------------------------------------
        */

        const medicineIds =
            items.map(
                (item) =>
                    item.medicine ||
                    item.id
            );


        const medicines =
            await Medicine.find({
                _id: {
                    $in: medicineIds,
                },
            }).lean();


        if (
            medicines.length !==
            medicineIds.length
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "One or more medicines could not be found.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | CREATE ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        const orderItems =
            items.map((item) => {

                const medicine =
                    medicines.find(
                        (medicine) =>
                            medicine._id.toString() ===
                            String(
                                item.medicine ||
                                item.id
                            )
                    );


                const quantity =
                    Math.max(
                        Number(
                            item.quantity || 1
                        ),
                        1
                    );


                const price =
                    Number(
                        medicine.price || 0
                    );


                return {

                    medicine:
                        medicine._id,

                    name:
                        medicine.name,

                    genericName:
                        medicine.genericName ||
                        "",

                    strength:
                        medicine.strength ||
                        "",

                    unit:
                        medicine.unit ||
                        "",

                    price,

                    quantity,

                    subtotal:
                        price * quantity,

                };

            });


        /*
        |--------------------------------------------------------------------------
        | TOTALS
        |--------------------------------------------------------------------------
        */

        const subtotal =
            orderItems.reduce(
                (total, item) =>
                    total +
                    item.subtotal,
                0
            );


        const safeDeliveryFee =
            Math.max(
                Number(
                    deliveryFee || 0
                ),
                0
            );


        const total =
            subtotal +
            safeDeliveryFee;


        /*
        |--------------------------------------------------------------------------
        | ORDER CODE
        |--------------------------------------------------------------------------
        */

        const orderId =
            `ML-ORD-${Date.now()
                .toString()
                .slice(-8)}`;


        /*
        |--------------------------------------------------------------------------
        | CREATE ORDER
        |--------------------------------------------------------------------------
        */

        const order =
            await Order.create({

                orderId,

                prescription:
                    prescription._id,

                user:
                    prescription.user ||
                    null,

                patient:
                    prescription.patient,

                items:
                    orderItems,

                subtotal,

                deliveryFee:
                    safeDeliveryFee,

                total,

                adminNote,

                status:
                    "pending",

            });


        /*
        |--------------------------------------------------------------------------
        | UPDATE PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        prescription.medicines =
            orderItems.map(
                (item) => ({
                    medicine:
                        item.medicine,

                    name:
                        item.name,

                    genericName:
                        item.genericName,

                    strength:
                        item.strength,

                    unit:
                        item.unit,

                    price:
                        item.price,

                    quantity:
                        item.quantity,
                })
            );


        prescription.order =
            order._id;


        prescription.status =
            "order_created";


        prescription.internalNote =
            adminNote;


        if (
            !Array.isArray(
                prescription.statusHistory
            )
        ) {

            prescription.statusHistory =
                [];

        }


        prescription.statusHistory.push({
            status:
                "order_created",

            note:
                "Medicine order created by admin.",

            timestamp:
                new Date(),
        });


        await prescription.save();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({

            success: true,

            message:
                "Medicine order created successfully.",

            order:
                JSON.parse(
                    JSON.stringify(
                        order
                    )
                ),

            prescription:
                JSON.parse(
                    JSON.stringify(
                        prescription
                    )
                ),

        });


    } catch (error) {

        console.error(
            "Create prescription order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to create medicine order.",

        });

    }

});


handler.get(async (req, res) => {

    try {

        await db.connect();


        const {
            id,
        } = req.query;


        const prescription =
            await Prescription
                .findById(id)
                .populate(
                    "user",
                    "name phone email"
                )
                .populate(
                    "order",
                    "orderId trackingNumber status deliveryFee total"
                )
                .lean();


        if (!prescription) {

            return res.status(404).json({

                success: false,

                message:
                    "Prescription not found.",

            });

        }


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



handler.patch(async (req, res) => {

    try {

        await db.connect();


        const {
            id,
        } = req.query;


        const {
            status,
            reason = "",
            internalNote,
        } = req.body;


        const prescription =
            await Prescription.findById(id);


        if (!prescription) {

            return res.status(404).json({

                success: false,

                message:
                    "Prescription not found.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | STATUS UPDATE
        |--------------------------------------------------------------------------
        */

        if (status) {

            const allowedStatuses = [
                "pending",
                "reviewing",
                "order_created",
                "completed",
                "rejected",
            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid prescription status.",

                });

            }


            prescription.status =
                status;


            if (
                !Array.isArray(
                    prescription.statusHistory
                )
            ) {

                prescription.statusHistory =
                    [];

            }


            prescription.statusHistory.push({

                status,

                note:
                    reason ||
                    `Prescription status changed to ${status}.`,

                timestamp:
                    new Date(),

            });


            if (
                status === "rejected"
            ) {

                prescription.reviewNote =
                    reason;

            }

        }


        /*
        |--------------------------------------------------------------------------
        | INTERNAL NOTE
        |--------------------------------------------------------------------------
        */

        if (
            typeof internalNote ===
            "string"
        ) {

            prescription.internalNote =
                internalNote;

        }


        await prescription.save();


        return res.status(200).json({

            success: true,

            message:
                "Prescription updated successfully.",

            prescription:
                JSON.parse(
                    JSON.stringify(
                        prescription
                    )
                ),

        });


    } catch (error) {

        console.error(
            "Update prescription error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update prescription.",

        });

    }

});


export default handler;