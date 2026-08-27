import db from "@/database/connection";
import Prescription from "@/database/model/Prescription";
import nextConnect from "next-connect";
import User from '@/database/model/User'
import Order from '@/database/model/Orders'

const handler = nextConnect();

handler.post(async (req, res) => {
    try {
        await db.connect();

        const {
            user,
            patient,
            files,
            notes = "",
        } = req.body;

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

        if (!Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one prescription file is required.",
            });
        }

        const requestCode =
            `RX-${Date.now().toString().slice(-8)}`;

        const prescription =
            await Prescription.create({
                requestCode,

                user: user || null,

                patient: {
                    name: patient.name.trim(),
                    phone: patient.phone.trim(),
                    address: patient.address.trim(),
                },

                files,

                notes: notes.trim(),

                status: "pending",

                statusHistory: [
                    {
                        status: "pending",
                        note: "Prescription submitted.",
                    },
                ],
            });

        return res.status(201).json({
            success: true,
            message: "Prescription submitted successfully.",
            prescription,
        });

    } catch (error) {
        console.error(
            "Create prescription error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create prescription.",
        });
    }
});

handler.get(async (req, res) => {
    try {
        await db.connect();

        const {
            status,
            user,
            search,
            date,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {};

        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        if (
            status &&
            status !== "all"
        ) {
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

            const searchValue =
                search.trim();

            filter.$or = [
                {
                    requestCode: {
                        $regex: searchValue,
                        $options: "i",
                    },
                },
                {
                    "patient.name": {
                        $regex: searchValue,
                        $options: "i",
                    },
                },
                {
                    "patient.phone": {
                        $regex: searchValue,
                        $options: "i",
                    },
                },
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | DATE FILTER
        |--------------------------------------------------------------------------
        */

        if (date && date !== "all") {

            const now = new Date();

            let startDate = null;

            if (date === "today") {

                startDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                );

            }

            if (date === "week") {

                startDate = new Date(
                    now.getTime() -
                    7 * 24 * 60 * 60 * 1000
                );

            }

            if (date === "month") {

                startDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );

            }

            if (startDate) {

                filter.createdAt = {
                    $gte: startDate,
                };

            }
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
        | DATA
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
        | STATISTICS
        |--------------------------------------------------------------------------
        */

        const [
            totalRequests,
            pending,
            reviewing,
            orderCreated,
            completed,
            rejected,
        ] = await Promise.all([

            Prescription.countDocuments(),

            Prescription.countDocuments({
                status: "pending",
            }),

            Prescription.countDocuments({
                status: "reviewing",
            }),

            Prescription.countDocuments({
                status: "order_created",
            }),

            Prescription.countDocuments({
                status: "completed",
            }),

            Prescription.countDocuments({
                status: "rejected",
            }),

        ]);

        return res.status(200).json({

            success: true,

            prescriptions,

            stats: {
                total: totalRequests,
                pending,
                reviewing,
                orderCreated,
                completed,
                rejected,
            },

            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(
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