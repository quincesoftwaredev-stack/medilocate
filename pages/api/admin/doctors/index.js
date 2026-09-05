import db from "@/database/connection";
import Doctor from "@/database/model/Doctor";
import User from "@/database/model/User";
import "@/database/model/Department";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(async (req, res) => {
    try {
        await db.connect();

        const {
            search = "",
            status = "all",
            verification = "all",
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {};

        if (
            status &&
            status !== "all"
        ) {
            filter.status = status;
        }

        if (
            verification &&
            verification !== "all"
        ) {
            filter.verificationStatus =
                verification;
        }

        if (search?.trim()) {
            const value =
                search.trim();

            filter.$or = [
                {
                    bmdcNumber: {
                        $regex: value,
                        $options: "i",
                    },
                },
                {
                    speciality: {
                        $regex: value,
                        $options: "i",
                    },
                },
            ];
        }

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

        let doctorsQuery =
            Doctor.find(filter)
                .populate(
                    "user",
                    "fullName firstName lastName email phone phoneNumber image role"
                )
                .populate(
                    "departments",
                    "name"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limitNumber);

        /*
        |--------------------------------------------------------------------------
        | SEARCH USER FIELDS
        |--------------------------------------------------------------------------
        |
        | Doctor data and User data are separate collections.
        | When search contains a name/phone/email, resolve matching users first.
        |
        */

        if (search?.trim()) {

const value =
                search.trim();

            const users =
                await User.find({
                    $or: [
                        {
                            fullName: {
                                $regex:
                                    value,
                                $options:
                                    "i",
                            },
                        },
                        {
                            firstName: {
                                $regex:
                                    value,
                                $options:
                                    "i",
                            },
                        },
                        {
                            lastName: {
                                $regex:
                                    value,
                                $options:
                                    "i",
                            },
                        },
                        {
                            email: {
                                $regex:
                                    value,
                                $options:
                                    "i",
                            },
                        },
                        {
                            phone: {
                                $regex:
                                    value,
                                $options:
                                    "i",
                            },
                        },
                    ],
                }).select("_id");

            const userIds =
                users.map(
                    (user) =>
                        user._id
                );

            filter.$or = [
                {
                    bmdcNumber: {
                        $regex:
                            value,
                        $options:
                            "i",
                    },
                },
                {
                    speciality: {
                        $regex:
                            value,
                        $options:
                            "i",
                    },
                },
                {
                    user: {
                        $in:
                            userIds,
                    },
                },
            ];

            doctorsQuery =
                Doctor.find(filter)
                    .populate(
                        "user",
                        "fullName firstName lastName email phone phoneNumber image role"
                    )
                    .populate(
                        "departments",
                        "name"
                    )
                    .sort({
                        createdAt: -1,
                    })
                    .skip(skip)
                    .limit(limitNumber);
        }

        const [
            doctors,
            total,
            totalDoctors,
            pending,
            verified,
            rejected,
            active,
        ] = await Promise.all([
            doctorsQuery.lean(),

            Doctor.countDocuments(
                filter
            ),

            Doctor.countDocuments(),

            Doctor.countDocuments({
                verificationStatus:
                    "pending",
            }),

            Doctor.countDocuments({
                verificationStatus:
                    "verified",
            }),

            Doctor.countDocuments({
                verificationStatus:
                    "rejected",
            }),

            Doctor.countDocuments({
                status: "active",
            }),
        ]);

        return res.status(200).json({
            success: true,

            doctors,

            stats: {
                total:
                    totalDoctors,
                pending,
                verified,
                rejected,
                active,
            },

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
            "Get admin doctors error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch doctors.",
        });
    }
});

export default handler;