import db from "@/database/connection";
import Medicine from "@/database/model/Medicine";
import nextConnect from "next-connect";


const handler =
    nextConnect();


/*
|--------------------------------------------------------------------------
| SET STOCK OF ALL MEDICINES TO 1000
|--------------------------------------------------------------------------
|
| GET:
|
| /api/admin/medicines/set-stock-1000
|
*/

handler.get(
    async (
        req,
        res
    ) => {

        try {

            /*
            |--------------------------------------------------------------------------
            | CONNECT DATABASE
            |--------------------------------------------------------------------------
            */

            await db.connect();


            /*
            |--------------------------------------------------------------------------
            | UPDATE ALL MEDICINES
            |--------------------------------------------------------------------------
            */

            const result =
                await Medicine.updateMany(
                    {},
                    {
                        $set: {
                            stock: 1000,
                        },
                    }
                );


            /*
            |--------------------------------------------------------------------------
            | DISCONNECT
            |--------------------------------------------------------------------------
            */

            await db.disconnect();


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
                        "Stock updated to 1000 for all medicines.",

                    matchedCount:
                        result.matchedCount,

                    modifiedCount:
                        result.modifiedCount,

                });


        } catch (
            error
        ) {

            console.error(
                "Update medicine stock error:",
                error
            );


            /*
            |--------------------------------------------------------------------------
            | TRY DISCONNECT
            |--------------------------------------------------------------------------
            */

            try {

                await db.disconnect();

            } catch (
                disconnectError
            ) {

                console.error(
                    "Database disconnect error:",
                    disconnectError
                );

            }


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to update medicine stock.",

                    error:
                        error.message,

                });

        }

    }
);


export default handler;