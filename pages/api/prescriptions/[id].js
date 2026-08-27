import db from "@/database/connection";
import Prescription from "@/database/model/Prescription";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(async (req, res) => {

    try {

        await db.connect();


        const {
            id,
        } = req.query;


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Prescription ID is required.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | FIND PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        let prescription;


        const isMongoId =
            /^[0-9a-fA-F]{24}$/.test(id);


        /*
        |--------------------------------------------------------------------------
        | FIND BY MONGODB ID
        |--------------------------------------------------------------------------
        */

        if (isMongoId) {

            prescription =
                await Prescription
                    .findById(id)
                    .populate(
                        "order",
                        "trackingNumber status deliveryFee total"
                    )
                    .lean();

        }


        /*
        |--------------------------------------------------------------------------
        | FIND BY REQUEST CODE
        |--------------------------------------------------------------------------
        */

        if (!prescription) {

            prescription =
                await Prescription
                    .findOne({
                        requestCode: id,
                    })
                    .populate(
                        "order",
                        "trackingNumber status deliveryFee total"
                    )
                    .lean();

        }


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


export default handler;