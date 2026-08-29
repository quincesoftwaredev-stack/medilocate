import db from "@/database/connection";
import Doctor from "@/database/model/Doctor";
import "@/database/model/Department";
import User from "@/database/model/User";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(async (req, res) => {
    try {
        await db.connect();

        const {
            search = "",
            specialty = "",
            gender = "",
            available = "",
            page = 1,
            limit = 12,
        } = req.query;

        const filter = {
            status: "active",
            verificationStatus: "verified",
            consultationFee: { $gt: 0 },
            bmdcNumber: { $regex: /\d/ },
            speciality: { $regex: /\S/ },
            education: { $regex: /\S/ },
            workingIn: { $regex: /\S/ },
        };

        const completeUserFilter = {
            role: "doctor",
            $and: [
                {
                    $or: [
                        { fullName: { $regex: /\S/ } },
                        { firstName: { $regex: /\S/ } },
                    ],
                },
                {
                    $or: [
                        { phone: { $regex: /\S/ } },
                        { phoneNumber: { $regex: /\S/ } },
                    ],
                },
            ],
        };

        if (gender) {
            completeUserFilter.gender = gender;
        }

        const completeUsers = await User.find(completeUserFilter).select("_id");
        const completeUserIds = completeUsers.map((user) => user._id);

        filter.user = { $in: completeUserIds };

        /*
        |--------------------------------------------------------------------------
        | SPECIALITY
        |--------------------------------------------------------------------------
        */

        if (specialty) {
            filter.speciality = specialty;
        }

        /*
        |--------------------------------------------------------------------------
        | AVAILABILITY
        |--------------------------------------------------------------------------
        */

        if (
            available === "true" ||
            available === "1"
        ) {
            filter.availableForHomeVisit = true;
        }

        /*
        |--------------------------------------------------------------------------
        | SEARCH USER + DOCTOR
        |--------------------------------------------------------------------------
        */

        if (search?.trim()) {

            const searchValue =
                search.trim();

            const users =
                await User.find({
                    _id: { $in: completeUserIds },
                    $or: [
                        {
                            fullName: {
                                $regex:
                                    searchValue,
                                $options:
                                    "i",
                            },
                        },
                        {
                            firstName: {
                                $regex:
                                    searchValue,
                                $options:
                                    "i",
                            },
                        },
                        {
                            lastName: {
                                $regex:
                                    searchValue,
                                $options:
                                    "i",
                            },
                        },
                        {
                            email: {
                                $regex:
                                    searchValue,
                                $options:
                                    "i",
                            },
                        },
                        {
                            phone: {
                                $regex:
                                    searchValue,
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
                    speciality: {
                        $regex:
                            searchValue,
                        $options:
                            "i",
                    },
                },
                {
                    education: {
                        $regex:
                            searchValue,
                        $options:
                            "i",
                    },
                },
                {
                    workingIn: {
                        $regex:
                            searchValue,
                        $options:
                            "i",
                    },
                },
                {
                    bmdcNumber: {
                        $regex:
                            searchValue,
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
        }

        /*
        |--------------------------------------------------------------------------
        | GENDER
        |--------------------------------------------------------------------------
        |
        | Your old gender field exists in User.
        |
        */

        // Gender is applied while selecting complete public user profiles above.

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
                    Number(limit) || 12,
                    1
                ),
                50
            );

        const skip =
            (pageNumber - 1) *
            limitNumber;

        /*
        |--------------------------------------------------------------------------
        | FETCH
        |--------------------------------------------------------------------------
        */

        const [
            doctors,
            total,
        ] = await Promise.all([

            Doctor.find(filter)
                .populate(
                    "user",
                    "fullName firstName lastName email phone phoneNumber image"
                )
                .populate(
                    "departments",
                    "name"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            Doctor.countDocuments(
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

            doctors,

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
            "Get doctors error:",
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
