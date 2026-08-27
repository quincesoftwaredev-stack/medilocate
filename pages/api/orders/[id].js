import db from "@/database/connection";
import Order from "@/database/model/Orders";
import nextConnect from "next-connect";
import mongoose from "mongoose";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| GET /api/orders/:id
|--------------------------------------------------------------------------
|
| `id` can be either:
|
| 1. MongoDB Order ID
| 2. Order tracking number
|
|--------------------------------------------------------------------------
*/

handler.get(async (req, res) => {

    let connected = false;


    try {

        /*
        |--------------------------------------------------------------------------
        | PARAMETER
        |--------------------------------------------------------------------------
        */

        const {
            id
        } = req.query;


        if (!id) {

            return res.status(400).json({

                message:
                    "Order ID or tracking number is required."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | DATABASE CONNECTION
        |--------------------------------------------------------------------------
        */

        await db.connect();

        connected = true;


        /*
        |--------------------------------------------------------------------------
        | FIND ORDER
        |--------------------------------------------------------------------------
        |
        | If the parameter is a valid MongoDB ObjectId,
        | first try `_id`.
        |
        | Otherwise, search using `trackingNumber`.
        |
        */

        let order = null;


        if (
            mongoose.Types.ObjectId.isValid(id)
        ) {

            order =
                await Order
                    .findById(id)
                    .populate(
                        "items.medicine"
                    )
                    .lean();

        }


        /*
        |--------------------------------------------------------------------------
        | FALLBACK TO TRACKING NUMBER
        |--------------------------------------------------------------------------
        */

        if (!order) {

            order =
                await Order
                    .findOne({
                        trackingNumber:
                            String(id).trim(),
                    })
                    .populate(
                        "items.medicine"
                    )
                    .lean();

        }


        /*
        |--------------------------------------------------------------------------
        | ORDER NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (!order) {

            return res.status(404).json({

                message:
                    "Order not found."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            ...order,


            /*
            | Current order status
            */

            status:
                order.status ||
                "pending",


            /*
            | Status history / timeline
            */

            statusHistory:
                Array.isArray(
                    order.statusHistory
                )
                    ? order.statusHistory
                    : [],

        });


    } catch (error) {

        console.error(
            "GET ORDER ERROR:",
            error
        );


        return res.status(500).json({

            message:
                "Server Error"

        });


    } finally {

        /*
        |--------------------------------------------------------------------------
        | DATABASE DISCONNECT
        |--------------------------------------------------------------------------
        */

        if (connected) {

            try {

                await db.disconnect();

            } catch (error) {

                console.error(
                    "DATABASE DISCONNECT ERROR:",
                    error
                );

            }

        }

    }

});


export default handler;