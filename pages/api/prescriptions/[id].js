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

export default handler;