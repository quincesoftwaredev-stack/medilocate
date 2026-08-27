import db from "@/database/connection";
import Order from "@/database/model/Orders";
import nextConnect from "next-connect";
import mongoose from "mongoose";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| PATCH /api/admin/orders/:id/status
|--------------------------------------------------------------------------
*/

handler.patch(async (req, res) => {

    let connected = false;


    try {

        /*
        |--------------------------------------------------------------------------
        | ORDER ID
        |--------------------------------------------------------------------------
        */

        const {
            id
        } = req.query;


        /*
        |--------------------------------------------------------------------------
        | VALIDATE ID
        |--------------------------------------------------------------------------
        */

        if (
            !id ||
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order ID.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | REQUEST BODY
        |--------------------------------------------------------------------------
        */

        const {
            status,
            note = "",
        } = req.body || {};


        /*
        |--------------------------------------------------------------------------
        | VALID STATUSES
        |--------------------------------------------------------------------------
        */

        const validStatuses = [

            "pending",
            "preparing",
            "ready",
            "assigned",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "failed",

        ];


        /*
        |--------------------------------------------------------------------------
        | VALIDATE STATUS
        |--------------------------------------------------------------------------
        */

        if (
            !status ||
            !validStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | DATABASE
        |--------------------------------------------------------------------------
        */

        await db.connect();

        connected = true;


        /*
        |--------------------------------------------------------------------------
        | FIND ORDER
        |--------------------------------------------------------------------------
        */

        const order =
            await Order.findById(id);


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | PREVENT UNNECESSARY STATUS UPDATE
        |--------------------------------------------------------------------------
        */

        if (
            order.status === status
        ) {

            const populatedOrder =
                await Order
                    .findById(id)
                    .populate(
                        "items.medicine"
                    )
                    .lean();


            return res.status(200).json({

                success: true,

                message:
                    "Order status is already up to date.",

                order:
                    populatedOrder,

            });

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE CURRENT STATUS
        |--------------------------------------------------------------------------
        */

        order.status =
            status;


        /*
        |--------------------------------------------------------------------------
        | ADD STATUS HISTORY
        |--------------------------------------------------------------------------
        */

        if (
            !Array.isArray(
                order.statusHistory
            )
        ) {

            order.statusHistory = [];

        }


        order.statusHistory.push({

            status,

            timestamp:
                new Date(),

            note:
                typeof note === "string"
                    ? note.trim()
                    : "",

        });


        /*
        |--------------------------------------------------------------------------
        | SAVE
        |--------------------------------------------------------------------------
        */

        await order.save();


        /*
        |--------------------------------------------------------------------------
        | GET UPDATED ORDER
        |--------------------------------------------------------------------------
        */

        const updatedOrder =
            await Order
                .findById(id)
                .populate(
                    "items.medicine"
                )
                .lean();


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            message:
                "Order status updated successfully.",

            order:
                updatedOrder,

        });


    } catch (error) {

        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server Error.",

        });

    } finally {

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