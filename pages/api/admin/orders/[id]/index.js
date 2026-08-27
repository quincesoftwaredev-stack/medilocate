import db from "@/database/connection";
import Order from "@/database/model/Orders";
import nextConnect from "next-connect";
import mongoose from "mongoose";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| PATCH /api/admin/orders/:id
|--------------------------------------------------------------------------
|
| Update optional order information.
|
| Supported fields:
|
| - internalNote
| - notes
|
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
        | DATABASE
        |--------------------------------------------------------------------------
        */

        await db.connect();

        connected = true;


        /*
        |--------------------------------------------------------------------------
        | REQUEST BODY
        |--------------------------------------------------------------------------
        */

        const body =
            req.body || {};


        /*
        |--------------------------------------------------------------------------
        | BUILD UPDATE
        |--------------------------------------------------------------------------
        */

        const update = {};


        /*
        |--------------------------------------------------------------------------
        | INTERNAL NOTE
        |--------------------------------------------------------------------------
        |
        | Optional.
        |
        | Empty string is allowed so admins can clear the note.
        |
        */

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "internalNote"
            )
        ) {

            if (
                body.internalNote === null
            ) {

                update.internalNote =
                    "";

            } else if (
                typeof body.internalNote ===
                "string"
            ) {

                update.internalNote =
                    body.internalNote.trim();

            } else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Internal note must be a string.",

                });

            }

        }


        /*
        |--------------------------------------------------------------------------
        | CUSTOMER NOTE
        |--------------------------------------------------------------------------
        |
        | Optional.
        |
        | Empty string is allowed.
        |
        */

        if (
            Object.prototype.hasOwnProperty.call(
                body,
                "notes"
            )
        ) {

            if (
                body.notes === null
            ) {

                update.notes =
                    "";

            } else if (
                typeof body.notes ===
                "string"
            ) {

                update.notes =
                    body.notes.trim();

            } else {

                return res.status(400).json({

                    success: false,

                    message:
                        "Notes must be a string.",

                });

            }

        }


        /*
        |--------------------------------------------------------------------------
        | NOTHING TO UPDATE
        |--------------------------------------------------------------------------
        */

        if (
            Object.keys(update).length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No fields provided for update.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE ORDER
        |--------------------------------------------------------------------------
        */

        const order =
            await Order
                .findByIdAndUpdate(

                    id,

                    {
                        $set:
                            update,
                    },

                    {
                        new: true,

                        runValidators: true,

                    }

                )
                .populate(
                    "items.medicine"
                )
                .lean();


        /*
        |--------------------------------------------------------------------------
        | ORDER NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            message:
                "Order updated successfully.",

            order,

        });


    } catch (error) {

        console.error(
            "UPDATE ADMIN ORDER ERROR:",
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