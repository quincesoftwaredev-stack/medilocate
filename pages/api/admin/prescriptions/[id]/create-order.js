import db from "@/database/connection";
import Prescription from "@/database/model/Prescription";
import Order from "@/database/model/Orders";
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

        if (prescription.order) {

            return res.status(400).json({

                success: false,

                message:
                    "An order has already been created for this prescription.",

                orderId:
                    prescription.order,

            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE ITEMS
        |--------------------------------------------------------------------------
        */

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
        | MEDICINE IDS
        |--------------------------------------------------------------------------
        */

        const medicineIds =
            items.map(
                (item) =>
                    item.medicine
            );


        /*
        |--------------------------------------------------------------------------
        | GET MEDICINES
        |--------------------------------------------------------------------------
        */

        const medicines =
            await Medicine.find({

                _id: {
                    $in:
                        medicineIds,
                },

            });


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
        | BUILD ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        const orderItems = [];

        let subtotal = 0;


        for (
            const item
            of items
        ) {

            const medicine =
                medicines.find(
                    (medicine) =>
                        medicine._id.toString() ===
                        item.medicine.toString()
                );


            if (!medicine) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Medicine not found.",

                });

            }


            const quantity =
                Number(
                    item.quantity
                );


            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity < 1
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Invalid quantity for ${medicine.name}.`,

                });

            }


            const unitPrice =
                Number(
                    medicine.price
                );


            if (
                !Number.isFinite(
                    unitPrice
                ) ||
                unitPrice < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Invalid price for ${medicine.name}.`,

                });

            }


            const itemSubtotal =
                unitPrice *
                quantity;


            subtotal +=
                itemSubtotal;


            orderItems.push({

                medicine:
                    medicine._id,

                quantity,

                unitPrice,

            });

        }


        /*
        |--------------------------------------------------------------------------
        | DELIVERY FEE
        |--------------------------------------------------------------------------
        */

        const parsedDeliveryFee =
            Number(
                deliveryFee
            );


        if (
            !Number.isFinite(
                parsedDeliveryFee
            ) ||
            parsedDeliveryFee < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid delivery fee.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | TOTAL
        |--------------------------------------------------------------------------
        */

        const total =
            subtotal +
            parsedDeliveryFee;


        /*
        |--------------------------------------------------------------------------
        | PATIENT / DELIVERY
        |--------------------------------------------------------------------------
        */

        const patient =
            prescription.patient ||
            {};


        if (
            !patient.name ||
            !patient.phone ||
            !patient.address
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Patient delivery information is incomplete.",

            });

        }


        const city =
            patient.city?.trim() ||
            "Rangpur";


        /*
        |--------------------------------------------------------------------------
        | TRACKING NUMBER
        |--------------------------------------------------------------------------
        */

        let trackingNumber;


        do {

            trackingNumber =
                `ML-${Date.now()
                    .toString()
                    .slice(-8)}${Math.floor(
                    10 +
                    Math.random() *
                    90
                )}`;

        } while (
            await Order.exists({
                trackingNumber,
            })
        );


        /*
        |--------------------------------------------------------------------------
        | CREATE ORDER
        |--------------------------------------------------------------------------
        */

        const order =
            await Order.create({

                trackingNumber,

                user:
                    prescription.user ||
                    null,

                items:
                    orderItems,

                delivery: {

                    name:
                        patient.name,

                    phone:
                        patient.phone,

                    address:
                        patient.address,

                    city,

                },

                paymentMethod:
                    "cod",

                paymentStatus:
                    "pending",

                status:
                    "pending",

                statusHistory: [

                    {

                        status:
                            "pending",

                        timestamp:
                            new Date(),

                        note:
                            "Order created from prescription.",

                    },

                ],

                prescription:
                    prescription._id,

                subtotal,

                deliveryFee:
                    parsedDeliveryFee,

                total,

                notes:
                    prescription.notes ||
                    "",

                internalNote:
                    adminNote || "",

            });


        /*
        |--------------------------------------------------------------------------
        | UPDATE PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        prescription.medicines =
            orderItems.map(
                (item) => {

                    const medicine =
                        medicines.find(
                            (medicine) =>
                                medicine._id.toString() ===
                                item.medicine.toString()
                        );


                    return {

                        medicine:
                            item.medicine,

                        prescribedName:
                            medicine.name,

                        quantity:
                            item.quantity,

                        status:
                            "identified",

                        note:
                            "",

                    };

                }
            );


        prescription.order =
            order._id;


        prescription.status =
            "order_created";


        prescription.internalNote =
            adminNote || "";


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

            timestamp:
                new Date(),

            note:
                "Medicine order created from prescription.",

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
                "Order created successfully.",

            order: {

                _id:
                    order._id,

                trackingNumber:
                    order.trackingNumber,

                prescription:
                    order.prescription,

                items:
                    order.items,

                subtotal:
                    order.subtotal,

                deliveryFee:
                    order.deliveryFee,

                total:
                    order.total,

                status:
                    order.status,

            },

            prescription: {

                _id:
                    prescription._id,

                requestCode:
                    prescription.requestCode,

                status:
                    prescription.status,

                order:
                    prescription.order,

            },

        });

    } catch (error) {

        console.error(
            "Create prescription order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create order.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

});


export default handler;