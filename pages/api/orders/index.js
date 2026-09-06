import BASE_URL from "@/config";
import Message from "@/services/message-service";
import { whatsapp } from "@/utility/const";
import db from "@/database/connection";
import Medicine from "@/database/model/Medicine";
import Order from "@/database/model/Orders";
import nextConnect from "next-connect";
import crypto from "crypto";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| GENERATE UNIQUE TRACKING NUMBER
|--------------------------------------------------------------------------
*/

const generateTrackingNumber =
    async () => {

        let trackingNumber;

        let exists = true;


        while (exists) {

            const randomPart =
                crypto
                    .randomBytes(5)
                    .toString("hex")
                    .toUpperCase();


            trackingNumber =
                `ML-TRK-${randomPart}`;


            exists =
                await Order.exists({
                    trackingNumber
                });

        }


        return trackingNumber;

    };


/*
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
*/

handler.post(async (req, res) => {

    let connected = false;


    try {

        /*
        |--------------------------------------------------------------------------
        | DATABASE
        |--------------------------------------------------------------------------
        */

        await db.connect();

        connected = true;


        /*
        |--------------------------------------------------------------------------
        | REQUEST DATA
        |--------------------------------------------------------------------------
        */

        const {

            items,

            delivery,

            paymentMethod =
                "cod",

            notes =
                "",

            prescription =
                null,

        } = req.body;


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

                message:
                    "Your cart is empty."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE DELIVERY
        |--------------------------------------------------------------------------
        */

        if (!delivery) {

            return res.status(400).json({

                message:
                    "Delivery information is required."

            });

        }


        const {

            name,

            phone,

            address,

            city,

        } = delivery;


        /*
        |--------------------------------------------------------------------------
        | VALIDATE PATIENT NAME
        |--------------------------------------------------------------------------
        */

        if (
            !name?.trim()
        ) {

            return res.status(400).json({

                message:
                    "Patient name is required."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE PHONE
        |--------------------------------------------------------------------------
        */

        if (
            !phone?.trim()
        ) {

            return res.status(400).json({

                message:
                    "Phone number is required."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE ADDRESS
        |--------------------------------------------------------------------------
        */

        if (
            !address?.trim()
        ) {

            return res.status(400).json({

                message:
                    "Delivery address is required."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE CITY
        |--------------------------------------------------------------------------
        */

        if (
            !city?.trim()
        ) {

            return res.status(400).json({

                message:
                    "City is required."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | PAYMENT METHOD
        |--------------------------------------------------------------------------
        */

        if (
            ![
                "cod",
                "online"
            ].includes(
                paymentMethod
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid payment method."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE CART ITEMS
        |--------------------------------------------------------------------------
        |
        | Frontend sends:
        |
        | {
        |     medicine: medicineId,
        |     quantity: 2
        | }
        |
        */

        const itemMap =
            new Map();


        for (
            const item of items
        ) {

            /*
            |--------------------------------------------------------------------------
            | VALIDATE ITEM
            |--------------------------------------------------------------------------
            */

            if (
                !item.medicine ||
                item.quantity === undefined
            ) {

                return res.status(400).json({

                    message:
                        "Invalid medicine item."

                });

            }


            /*
            |--------------------------------------------------------------------------
            | QUANTITY
            |--------------------------------------------------------------------------
            */

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

                    message:
                        "Invalid medicine quantity."

                });

            }


            const medicineId =
                String(
                    item.medicine
                );


            /*
            |--------------------------------------------------------------------------
            | COMBINE DUPLICATES
            |--------------------------------------------------------------------------
            */

            if (
                itemMap.has(
                    medicineId
                )
            ) {

                itemMap.get(
                    medicineId
                ).quantity +=
                    quantity;

            } else {

                itemMap.set(

                    medicineId,

                    {

                        medicine:
                            medicineId,

                        quantity,

                    }

                );

            }

        }


        const requestedItems =
            Array.from(
                itemMap.values()
            );


        /*
        |--------------------------------------------------------------------------
        | MEDICINE IDS
        |--------------------------------------------------------------------------
        */

        const medicineIds =
            requestedItems.map(
                item =>
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
                        medicineIds
                },

                status:
                    "active",

            }).lean();


        /*
        |--------------------------------------------------------------------------
        | CHECK MEDICINE AVAILABILITY
        |--------------------------------------------------------------------------
        */

        if (
            medicines.length !==
            medicineIds.length
        ) {

            return res.status(400).json({

                message:
                    "One or more medicines are no longer available."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | MEDICINE MAP
        |--------------------------------------------------------------------------
        */

        const medicineMap =
            new Map(

                medicines.map(
                    medicine => [

                        String(
                            medicine._id
                        ),

                        medicine,

                    ]
                )

            );


        /*
        |--------------------------------------------------------------------------
        | CREATE ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        const orderItems = [];

        let subtotal = 0;


        for (
            const requestedItem
            of requestedItems
        ) {

            const medicine =
                medicineMap.get(

                    String(
                        requestedItem.medicine
                    )

                );


            /*
            |--------------------------------------------------------------------------
            | STOCK CHECK
            |--------------------------------------------------------------------------
            */

            if (
                medicine.stock === false
            ) {

                return res.status(400).json({

                    message:
                        `${medicine.name} is currently out of stock.`

                });

            }


            /*
            |--------------------------------------------------------------------------
            | PRICE
            |--------------------------------------------------------------------------
            */

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

                    message:
                        `Invalid price for ${medicine.name}.`

                });

            }


            /*
            |--------------------------------------------------------------------------
            | ITEM TOTAL
            |--------------------------------------------------------------------------
            */

            const itemTotal =
                unitPrice *
                requestedItem.quantity;


            subtotal +=
                itemTotal;


            /*
            |--------------------------------------------------------------------------
            | ORDER ITEM
            |--------------------------------------------------------------------------
            */

            orderItems.push({

                medicine:
                    medicine._id,

                quantity:
                    requestedItem.quantity,

                unitPrice,

            });

        }


        /*
        |--------------------------------------------------------------------------
        | DELIVERY FEE
        |--------------------------------------------------------------------------
        */

        const deliveryFee =
            subtotal >= 500
                ? 0
                : 50;


        /*
        |--------------------------------------------------------------------------
        | TOTAL
        |--------------------------------------------------------------------------
        */

        const total =
            subtotal +
            deliveryFee;


        /*
        |--------------------------------------------------------------------------
        | UNIQUE TRACKING NUMBER
        |--------------------------------------------------------------------------
        */

        const trackingNumber =
            await generateTrackingNumber();


        /*
        |--------------------------------------------------------------------------
        | INITIAL STATUS HISTORY
        |--------------------------------------------------------------------------
        */

        const statusHistory = [

            {

                status:
                    "pending",

                timestamp:
                    new Date(),

                note:
                    "Order placed successfully.",

            },

        ];


        /*
        |--------------------------------------------------------------------------
        | CREATE ORDER
        |--------------------------------------------------------------------------
        */

        const order =
            await Order.create({

                /*
                |--------------------------------------------------------------
                | USER
                |--------------------------------------------------------------
                */

                user:
                    null,


                /*
                |--------------------------------------------------------------
                | UNIQUE TRACKING NUMBER
                |--------------------------------------------------------------
                */

                trackingNumber,


                /*
                |--------------------------------------------------------------
                | ORDER ITEMS
                |--------------------------------------------------------------
                */

                items:
                    orderItems,


                /*
                |--------------------------------------------------------------
                | DELIVERY
                |--------------------------------------------------------------
                */

                delivery: {

                    name:
                        name.trim(),

                    phone:
                        phone.trim(),

                    address:
                        address.trim(),

                    city:
                        city.trim(),

                },


                /*
                |--------------------------------------------------------------
                | PAYMENT
                |--------------------------------------------------------------
                */

                paymentMethod,

                paymentStatus:
                    "pending",


                /*
                |--------------------------------------------------------------
                | CURRENT STATUS
                |--------------------------------------------------------------
                */

                status:
                    "pending",


                /*
                |--------------------------------------------------------------
                | STATUS HISTORY
                |--------------------------------------------------------------
                */

                statusHistory,


                /*
                |--------------------------------------------------------------
                | PRESCRIPTION
                |--------------------------------------------------------------
                */

                prescription:
                    prescription || null,


                /*
                |--------------------------------------------------------------
                | PRICING
                |--------------------------------------------------------------
                */

                subtotal,

                deliveryFee,

                total,


                /*
                |--------------------------------------------------------------
                | NOTES
                |--------------------------------------------------------------
                */

                notes:
                    typeof notes === "string"
                        ? notes.trim()
                        : "",

            });


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        await new Message().sendMessage({
            number: whatsapp,
            message: `new order created - url:${BASE_URL}/admin/orders/${order._id}`,
        });

        return res.status(201).json({

            success:
                true,

            message:
                "Order placed successfully.",

            order: {

                id:
                    order._id,

                trackingNumber:
                    order.trackingNumber,

                status:
                    order.status,

                statusHistory:
                    order.statusHistory,

                paymentMethod:
                    order.paymentMethod,

                paymentStatus:
                    order.paymentStatus,

                subtotal:
                    order.subtotal,

                deliveryFee:
                    order.deliveryFee,

                total:
                    order.total,

                createdAt:
                    order.createdAt,

            },

        });


    } catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Server Error"

        });


    } finally {

        /*
        |--------------------------------------------------------------------------
        | DISCONNECT DATABASE
        |--------------------------------------------------------------------------
        */

        if (connected) {

            try {

                await db.disconnect();

            } catch (error) {

                console.error(
                    "Database disconnect error:",
                    error
                );

            }

        }

    }

});


export default handler;