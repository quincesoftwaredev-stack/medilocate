import db from "@/database/connection";
import Prescription from "@/database/model/Prescription";
import Message from "@/services/message-service";
import { whatsapp } from "@/utility/const";
import nextConnect from "next-connect";

const handler = nextConnect();


/*
|--------------------------------------------------------------------------
| CREATE PRESCRIPTION
|--------------------------------------------------------------------------
*/

handler.post(async (req, res) => {

    try {

        await db.connect();


        const {
            user,
            patient,
            files,
            notes = "",
        } = req.body;


        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!patient?.name?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Patient name is required.",
            });

        }


        if (!patient?.phone?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Patient phone is required.",
            });

        }


        if (!patient?.address?.trim()) {

            return res.status(400).json({
                success: false,
                message: "Patient address is required.",
            });

        }


        if (
            !Array.isArray(files) ||
            files.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "At least one prescription file is required.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE FILES
        |--------------------------------------------------------------------------
        */

        const invalidFile = files.some(
            (file) =>
                !file?.url ||
                typeof file.url !== "string"
        );


        if (invalidFile) {

            return res.status(400).json({
                success: false,
                message:
                    "Every prescription file must contain a valid URL.",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | REQUEST CODE
        |--------------------------------------------------------------------------
        */

        const requestCode =
            `RX-${Date.now().toString().slice(-8)}`;


        /*
        |--------------------------------------------------------------------------
        | CREATE PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        const prescription =
            await Prescription.create({

                requestCode,

                user:
                    user || null,

                patient: {

                    name:
                        patient.name.trim(),

                    phone:
                        patient.phone.trim(),

                    address:
                        patient.address.trim(),

                    city:
                        patient.city?.trim() || "",

                },

                files,

                notes:
                    typeof notes === "string"
                        ? notes.trim()
                        : "",

                medicines: [],

                status:
                    "pending",

                statusHistory: [

                    {
                        status:
                            "pending",

                        note:
                            "Prescription submitted.",
                    },

                ],

            });


        /*
        |----------------------------------------------------------------------
        | NOTIFY ADMIN
        |----------------------------------------------------------------------
        |
        | A failed SMS must never roll back an otherwise valid prescription.
        |
        */

        try {

            const messageService =
                new Message();

            await messageService.sendMessage({

                number:
                    whatsapp,

                message:
                    "A new prescription has been uploaded. Please review it in the MediLocate admin dashboard.",

            });

        } catch (messageError) {

            console.error(
                "Prescription notification error:",
                messageError
            );

        }


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(201).json({

            success: true,

            message:
                "Prescription submitted successfully.",

            prescription,

        });

    } catch (error) {

        console.error(
            "Create prescription error:",
            error
        );


        /*
        |--------------------------------------------------------------------------
        | DUPLICATE REQUEST CODE
        |--------------------------------------------------------------------------
        */

        if (error.code === 11000) {

            return res.status(409).json({

                success: false,

                message:
                    "Unable to create prescription request. Please try again.",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to create prescription.",

        });

    }

});


/*
|--------------------------------------------------------------------------
| GET PRESCRIPTIONS
|--------------------------------------------------------------------------
|
| Supported query parameters:
|
| ?status=pending
| ?user=USER_ID
| ?search=RX-12345678
| ?page=1
| ?limit=20
|
*/

handler.get(async (req, res) => {

    try {

        await db.connect();


        const {
            status,
            user,
            search,
            page = 1,
            limit = 20,
        } = req.query;


        /*
        |--------------------------------------------------------------------------
        | FILTER
        |--------------------------------------------------------------------------
        */

        const filter = {};


        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (status) {

            filter.status = status;

        }


        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        if (user) {

            filter.user = user;

        }


        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if (search?.trim()) {

            const searchRegex =
                search.trim();


            filter.$or = [

                {
                    requestCode: {
                        $regex:
                            searchRegex,
                        $options:
                            "i",
                    },
                },

                {
                    "patient.name": {
                        $regex:
                            searchRegex,
                        $options:
                            "i",
                    },
                },

                {
                    "patient.phone": {
                        $regex:
                            searchRegex,
                        $options:
                            "i",
                    },
                },

                {
                    "patient.address": {
                        $regex:
                            searchRegex,
                        $options:
                            "i",
                    },
                },

            ];

        }


        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            );


        const limitNumber =
            Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                100
            );


        const skip =
            (pageNumber - 1) *
            limitNumber;


        /*
        |--------------------------------------------------------------------------
        | FETCH DATA
        |--------------------------------------------------------------------------
        */

        const [
            prescriptions,
            total,
        ] = await Promise.all([

            Prescription.find(filter)

                .populate(
                    "user",
                    "name phone email"
                )

                .populate(
                    "reviewedBy",
                    "name email"
                )

                .populate(
                    "order",
                    "orderId trackingNumber status"
                )

                .sort({
                    createdAt: -1,
                })

                .skip(skip)

                .limit(limitNumber)

                .lean(),


            Prescription.countDocuments(
                filter
            ),

        ]);


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            prescriptions,

            pagination: {

                page:
                    pageNumber,

                limit:
                    limitNumber,

                total,

                pages:
                    Math.ceil(
                        total /
                        limitNumber
                    ),

            },

        });

    } catch (error) {

        console.error(
            "Get prescriptions error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch prescriptions.",

        });

    }

});


export default handler;
