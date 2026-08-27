import db from "@/database/connection";
import Order from "@/database/model/Orders";
import nextConnect from "next-connect";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| GET /api/admin/orders
|--------------------------------------------------------------------------
|
| Get all orders for admin order management.
|
*/


handler.get(async (req, res) => {

    try {

        await db.connect();


        /*
        |--------------------------------------------------------------------------
        | GET ORDERS
        |--------------------------------------------------------------------------
        */

        const orders =
            await Order
                .find({})
                .populate(
                    "items.medicine"
                )
                .sort({
                    createdAt: -1,
                })
                .lean();


        /*
        |--------------------------------------------------------------------------
        | NORMALIZE ORDERS
        |--------------------------------------------------------------------------
        */

        const normalizedOrders =
            orders.map(
                (order) => {


                    /*
                    |--------------------------------------------------------------------------
                    | SOURCE
                    |--------------------------------------------------------------------------
                    */

                    const source =
                        order.prescription
                            ? "prescription"
                            : "cart";


                    /*
                    |--------------------------------------------------------------------------
                    | ITEMS
                    |--------------------------------------------------------------------------
                    */

                    const orderItems =
                        Array.isArray(
                            order.items
                        )
                            ? order.items
                            : [];


                    const totalItems =
                        orderItems.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | CURRENT STATUS
                    |--------------------------------------------------------------------------
                    |
                    | Prefer the latest statusHistory entry.
                    | Fall back to order.status.
                    |
                    */

                    let currentStatus =
                        order.status ||
                        "pending";


                    if (
                        Array.isArray(
                            order.statusHistory
                        ) &&
                        order.statusHistory.length > 0
                    ) {

                        const latestStatus =
                            order.statusHistory[
                                order.statusHistory.length - 1
                            ];


                        if (
                            latestStatus &&
                            latestStatus.status
                        ) {

                            currentStatus =
                                latestStatus.status;

                        }

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | RIDER
                    |--------------------------------------------------------------------------
                    */

                    let rider = null;


                    if (
                        order.rider
                    ) {

                        if (
                            typeof order.rider ===
                            "object"
                        ) {

                            rider = {

                                id:
                                    order.rider._id
                                        ? String(
                                            order.rider._id
                                        )
                                        : null,

                                name:
                                    order.rider.name ||
                                    null,

                                phone:
                                    order.rider.phone ||
                                    null,

                            };

                        } else {

                            rider = {

                                id:
                                    String(
                                        order.rider
                                    ),

                                name:
                                    null,

                                phone:
                                    null,

                            };

                        }

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | REQUEST CODE
                    |--------------------------------------------------------------------------
                    */

                    let requestCode =
                        null;


                    if (
                        order.prescription &&
                        typeof order.prescription ===
                        "object"
                    ) {

                        requestCode =
                            order.prescription.requestCode ||
                            order.prescription.code ||
                            null;

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | DELIVERY
                    |--------------------------------------------------------------------------
                    */

                    const delivery =
                        order.delivery || {};


                    /*
                    |--------------------------------------------------------------------------
                    | RETURN NORMALIZED ORDER
                    |--------------------------------------------------------------------------
                    */

                    return {

                        id:
                            String(
                                order._id
                            ),


                        orderCode:
                            order.orderCode ||
                            null,


                        /*
                        |--------------------------------------------------------------
                        | Customer-facing tracking number
                        |--------------------------------------------------------------
                        */

                        trackingNumber:
                            order.trackingNumber ||
                            null,


                        source,


                        requestCode,


                        /*
                        |--------------------------------------------------------------
                        | Patient / delivery information
                        |--------------------------------------------------------------
                        */

                        patientName:
                            delivery.name ||
                            "N/A",


                        phone:
                            delivery.phone ||
                            "N/A",


                        address:
                            [
                                delivery.address,
                                delivery.city,
                            ]
                                .filter(Boolean)
                                .join(", "),


                        city:
                            delivery.city ||
                            null,


                        /*
                        |--------------------------------------------------------------
                        | Items
                        |--------------------------------------------------------------
                        */

                        items:
                            orderItems.length,


                        totalItems,


                        /*
                        |--------------------------------------------------------------
                        | Financial
                        |--------------------------------------------------------------
                        */

                        subtotal:
                            Number(
                                order.subtotal ||
                                0
                            ),


                        deliveryFee:
                            Number(
                                order.deliveryFee ||
                                0
                            ),


                        total:
                            Number(
                                order.total ||
                                0
                            ),


                        /*
                        |--------------------------------------------------------------
                        | Payment
                        |--------------------------------------------------------------
                        */

                        paymentMethod:
                            order.paymentMethod ||
                            "cod",


                        paymentStatus:
                            order.paymentStatus ||
                            "pending",


                        /*
                        |--------------------------------------------------------------
                        | Status
                        |--------------------------------------------------------------
                        */

                        status:
                            currentStatus,


                        /*
                        |--------------------------------------------------------------
                        | Rider
                        |--------------------------------------------------------------
                        */

                        rider,


                        riderName:
                            rider?.name ||
                            null,


                        /*
                        |--------------------------------------------------------------
                        | Status history
                        |--------------------------------------------------------------
                        */

                        statusHistory:
                            Array.isArray(
                                order.statusHistory
                            )
                                ? order.statusHistory
                                : [],


                        /*
                        |--------------------------------------------------------------
                        | Created / updated
                        |--------------------------------------------------------------
                        */

                        createdAt:
                            order.createdAt
                                ? order.createdAt.toISOString()
                                : null,


                        updatedAt:
                            order.updatedAt
                                ? order.updatedAt.toISOString()
                                : null,

                    };

                }
            );


        await db.disconnect();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            count:
                normalizedOrders.length,

            orders:
                normalizedOrders,

        });


    } catch (error) {

        console.log(
            "GET ADMIN ORDERS ERROR:",
            error
        );


        try {

            await db.disconnect();

        } catch (e) {}


        return res.status(500).json({

            success: false,

            message:
                "Server Error",

        });

    }

});


export default handler;