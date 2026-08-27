import db from "@/database/connection";
import Doctor from "@/database/model/Doctor";
import User from "@/database/model/User";
import nextConnect from "next-connect";

const handler = nextConnect();


/*
|--------------------------------------------------------------------------
| GET DOCTOR
|--------------------------------------------------------------------------
*/

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
                    "Doctor ID is required.",
            });

        }


        const doctor =
            await Doctor
                .findOne({
                    $or: [
                        {
                            _id: id,
                        },
                        {
                            user: id,
                        },
                    ],
                })
                .populate(
                    "user",
                    "fullName firstName lastName email phone phoneNumber image role gender"
                )
                .populate(
                    "departments",
                    "name"
                )
                .lean();


        if (!doctor) {

            return res.status(404).json({
                success: false,
                message:
                    "Doctor not found.",
            });

        }


        return res.status(200).json({

            success: true,

            doctor,

        });

    } catch (error) {

        console.error(
            "Get doctor error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch doctor.",

        });

    }

});


/*
|--------------------------------------------------------------------------
| UPDATE DOCTOR + USER
|--------------------------------------------------------------------------
*/

handler.patch(async (req, res) => {

    try {

        await db.connect();


        const {
            id,
        } = req.query;


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Doctor ID is required.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | FIND DOCTOR
        |--------------------------------------------------------------------------
        */

        const doctor =
            await Doctor.findOne({
                $or: [
                    {
                        _id: id,
                    },
                    {
                        user: id,
                    },
                ],
            });


        if (!doctor) {

            return res.status(404).json({

                success: false,

                message:
                    "Doctor not found.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | REQUEST DATA
        |--------------------------------------------------------------------------
        */

        const {
            user = {},
            doctor: doctorData = {},
        } = req.body;


        /*
        |--------------------------------------------------------------------------
        | FIND USER
        |--------------------------------------------------------------------------
        */

        const userId =
            doctor.user;


        const userDocument =
            await User.findById(
                userId
            );


        if (!userDocument) {

            return res.status(404).json({

                success: false,

                message:
                    "Associated user account not found.",

            });

        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        if (
            user.fullName !==
            undefined
        ) {

            const fullName =
                String(
                    user.fullName
                ).trim();


            if (!fullName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name cannot be empty.",

                });

            }


            userDocument.fullName =
                fullName;

        }


        if (
            user.phone !==
            undefined
        ) {

            const phone =
                String(
                    user.phone
                ).trim();


            if (!phone) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Phone number cannot be empty.",

                });

            }


            /*
            |--------------------------------------------------------------------------
            | PHONE DUPLICATE CHECK
            |--------------------------------------------------------------------------
            */

            const existingPhone =
                await User.findOne({

                    phone,

                    _id: {
                        $ne:
                            userDocument._id,
                    },

                });


            if (existingPhone) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This phone number is already in use.",

                });

            }


            userDocument.phone =
                phone;

        }


        if (
            user.email !==
            undefined
        ) {

            const email =
                String(
                    user.email
                )
                    .trim()
                    .toLowerCase();


            if (email) {

                /*
                |--------------------------------------------------------------------------
                | EMAIL DUPLICATE CHECK
                |--------------------------------------------------------------------------
                */

                const existingEmail =
                    await User.findOne({

                        email,

                        _id: {
                            $ne:
                                userDocument._id,
                        },

                    });


                if (existingEmail) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "This email is already in use.",

                    });

                }

            }


            userDocument.email =
                email;

        }


        if (
            user.image !==
            undefined
        ) {

            userDocument.image =
                String(
                    user.image || ""
                ).trim();

        }


        /*
        |--------------------------------------------------------------------------
        | SAVE USER
        |--------------------------------------------------------------------------
        */

        await userDocument.save();


        /*
        |--------------------------------------------------------------------------
        | UPDATE DOCTOR
        |--------------------------------------------------------------------------
        */

        if (
            doctorData.bmdcNumber !==
            undefined
        ) {

            doctor.bmdcNumber =
                String(
                    doctorData.bmdcNumber
                ).trim();

        }


        if (
            doctorData.speciality !==
            undefined
        ) {

            doctor.speciality =
                String(
                    doctorData.speciality
                ).trim();

        }


        if (
            doctorData.education !==
            undefined
        ) {

            doctor.education =
                String(
                    doctorData.education
                ).trim();

        }


        if (
            doctorData.workingIn !==
            undefined
        ) {

            doctor.workingIn =
                String(
                    doctorData.workingIn
                ).trim();

        }


        if (
            doctorData.totalExperience !==
            undefined
        ) {

            const experience =
                Number(
                    doctorData.totalExperience
                );


            if (
                !Number.isFinite(
                    experience
                ) ||
                experience < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid experience value.",

                });

            }


            doctor.totalExperience =
                experience;

        }


        if (
            doctorData.consultationFee !==
            undefined
        ) {

            const fee =
                Number(
                    doctorData.consultationFee
                );


            if (
                !Number.isFinite(
                    fee
                ) ||
                fee < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid consultation fee.",

                });

            }


            doctor.consultationFee =
                fee;

        }


        if (
            doctorData.followUpFee !==
            undefined
        ) {

            const fee =
                Number(
                    doctorData.followUpFee
                );


            if (
                !Number.isFinite(
                    fee
                ) ||
                fee < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid follow-up fee.",

                });

            }


            doctor.followUpFee =
                fee;

        }


        if (
            doctorData.about !==
            undefined
        ) {

            doctor.about =
                String(
                    doctorData.about
                ).trim();

        }


        /*
        |--------------------------------------------------------------------------
        | SAVE DOCTOR
        |--------------------------------------------------------------------------
        */

        await doctor.save();


        /*
        |--------------------------------------------------------------------------
        | FETCH UPDATED DATA
        |--------------------------------------------------------------------------
        */

        const updatedDoctor =
            await Doctor
                .findById(
                    doctor._id
                )
                .populate(
                    "user",
                    "fullName firstName lastName email phone phoneNumber image role gender"
                )
                .populate(
                    "departments",
                    "name"
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
                "Doctor profile updated successfully.",

            doctor:
                updatedDoctor,

        });

    } catch (error) {

        console.error(
            "Update doctor error:",
            error
        );


        if (
            error.code ===
            11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Some information is already in use.",

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to update doctor profile.",

            error:
                process.env.NODE_ENV ===
                "development"
                    ? error.message
                    : undefined,

        });

    }

});


export default handler;