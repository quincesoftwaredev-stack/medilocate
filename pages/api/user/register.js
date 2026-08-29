import bcrypt from "bcryptjs";
import db from "@/database/connection";

import User from "@/database/model/User";
import Doctor from "@/database/model/Doctor";
import Nurse from "@/database/model/Nurse";
import Rider from "@/database/model/Rider";

import nextConnect from "next-connect";

const handler = nextConnect();

handler.post(async (req, res) => {
    try {
        await db.connect();

        const {
            fullName,
            phone,
            email = "",
            password,
            role = "patient",
            profile = {},
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        if (!fullName?.trim()) {
            return res.status(400).json({
                error: "Full name is required.",
            });
        }

        if (!phone?.trim()) {
            return res.status(400).json({
                error: "Phone number is required.",
            });
        }

        if (!password) {
            return res.status(400).json({
                error: "Password is required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error:
                    "Password must be at least 6 characters.",
            });
        }

        const allowedRoles = [
            "patient",
            "doctor",
            "nurse",
            "rider",
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                error: "Invalid account type.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | NORMALIZE
        |--------------------------------------------------------------------------
        */

        const normalizedPhone =
            phone.trim();

        const normalizedEmail =
            email?.trim().toLowerCase() || "";

        /*
        |--------------------------------------------------------------------------
        | CHECK PHONE
        |--------------------------------------------------------------------------
        */

        const existingPhone =
            await User.findOne({
                phone: normalizedPhone,
            });

        if (existingPhone) {
            return res.status(409).json({
                error:
                    "An account already exists with this phone number.",
            });
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK EMAIL
        |--------------------------------------------------------------------------
        */

        if (normalizedEmail) {

            const existingEmail =
                await User.findOne({
                    email: normalizedEmail,
                });

            if (existingEmail) {
                return res.status(409).json({
                    error:
                        "An account already exists with this email.",
                });
            }
        }

        /*
        |--------------------------------------------------------------------------
        | HASH PASSWORD
        |--------------------------------------------------------------------------
        */

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        const user =
            await User.create({

                fullName:
                    fullName.trim(),

                phone:
                    normalizedPhone,

                email:
                    normalizedEmail,

                password:
                    hashedPassword,

                role,

                /*
                | Keep normal user account active.
                | Professional profiles themselves stay pending.
                */
                isVerified:
                    role === "patient",

            });

        /*
        |--------------------------------------------------------------------------
        | PATIENT
        |--------------------------------------------------------------------------
        |
        | Patient does not currently need a separate profile model.
        |
        */

        if (role === "patient") {

            return res.status(201).json({

                success: true,

                message:
                    "Account created successfully.",

                id:
                    user._id.toString(),

                user: {
                    id:
                        user._id.toString(),

                    fullName:
                        user.fullName,

                    phone:
                        user.phone,

                    email:
                        user.email,

                    role:
                        user.role,
                },

            });

        }

        /*
        |--------------------------------------------------------------------------
        | DOCTOR
        |--------------------------------------------------------------------------
        */

        if (role === "doctor") {

            if (!["Male", "Female"].includes(profile.gender)) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "Gender is required.",
                });
            }

            if (!profile.bmdcNumber?.trim()) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "BMDC number is required.",
                });
            }

            if (!profile.speciality?.trim()) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "Speciality is required.",
                });
            }


            const doctor =
                await Doctor.create({

                    user:
                        user._id,

                    bmdcNumber:
                        profile.bmdcNumber.trim(),

                    speciality:
                        profile.speciality.trim(),

                    education:
                        profile.education?.trim() || "",

                    workingIn:
                        profile.workingIn?.trim() || "",

                    totalExperience:
                        Number(
                            profile.totalExperience || 0
                        ),

                    consultationFee:
                        Number(
                            profile.consultationFee || 0
                        ),

                    followUpFee:
                        Number(
                            profile.followUpFee || 0
                        ),

                    about:
                        profile.about?.trim() || "",

                    verificationStatus:
                        "pending",

                    isVerified:
                        false,

                    status:
                        "inactive",

                });

            user.gender = profile.gender;
            await user.save();


            return res.status(201).json({

                success: true,

                message:
                    "Doctor application submitted successfully.",

                id:
                    user._id.toString(),

                user: {
                    id:
                        user._id.toString(),

                    fullName:
                        user.fullName,

                    phone:
                        user.phone,

                    email:
                        user.email,

                    role:
                        user.role,
                },

                profile: {
                    id:
                        doctor._id.toString(),

                    verificationStatus:
                        doctor.verificationStatus,

                    status:
                        doctor.status,
                },

            });

        }

        /*
        |--------------------------------------------------------------------------
        | NURSE
        |--------------------------------------------------------------------------
        */

        if (role === "nurse") {

            if (
                !profile.registrationNumber?.trim()
            ) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "Registration number is required.",
                });
            }

            if (
                !profile.qualification?.trim()
            ) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "Qualification is required.",
                });
            }


            const nurse =
                await Nurse.create({

                    user:
                        user._id,

                    registrationNumber:
                        profile.registrationNumber.trim(),

                    qualification:
                        profile.qualification.trim(),

                    specialization:
                        profile.specialization?.trim() || "",

                    institution:
                        profile.institution?.trim() || "",

                    experience:
                        Number(
                            profile.experience || 0
                        ),

                    homeVisitFee:
                        Number(
                            profile.homeVisitFee || 0
                        ),

                    about:
                        profile.about?.trim() || "",

                    verificationStatus:
                        "pending",

                    isVerified:
                        false,

                    status:
                        "inactive",

                });


            return res.status(201).json({

                success: true,

                message:
                    "Nurse application submitted successfully.",

                id:
                    user._id.toString(),

                user: {
                    id:
                        user._id.toString(),

                    fullName:
                        user.fullName,

                    phone:
                        user.phone,

                    email:
                        user.email,

                    role:
                        user.role,
                },

                profile: {
                    id:
                        nurse._id.toString(),

                    verificationStatus:
                        nurse.verificationStatus,

                    status:
                        nurse.status,
                },

            });

        }

        /*
        |--------------------------------------------------------------------------
        | RIDER
        |--------------------------------------------------------------------------
        */

        if (role === "rider") {

            if (
                !profile.vehicleNumber?.trim()
            ) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "Vehicle number is required.",
                });
            }

            if (
                !profile.serviceArea?.trim()
            ) {

                await User.findByIdAndDelete(
                    user._id
                );

                return res.status(400).json({
                    error:
                        "Service area is required.",
                });
            }


            /*
            | Generate rider code
            */

            let riderCode;

            do {

                riderCode =
                    `RDR-${Date.now()
                        .toString()
                        .slice(-8)}${Math.floor(
                        10 +
                        Math.random() * 90
                    )}`;

            } while (
                await Rider.exists({
                    riderCode,
                })
            );


            const rider =
                await Rider.create({

                    user:
                        user._id,

                    riderCode,

                    vehicleType:
                        profile.vehicleType ||
                        "motorcycle",

                    vehicleNumber:
                        profile.vehicleNumber.trim(),

                    serviceAreas: [
                        profile.serviceArea.trim(),
                    ],

                    isAvailable:
                        false,

                    verificationStatus:
                        "pending",

                    status:
                        "inactive",

                });


            return res.status(201).json({

                success: true,

                message:
                    "Rider application submitted successfully.",

                id:
                    user._id.toString(),

                user: {
                    id:
                        user._id.toString(),

                    fullName:
                        user.fullName,

                    phone:
                        user.phone,

                    email:
                        user.email,

                    role:
                        user.role,
                },

                profile: {
                    id:
                        rider._id.toString(),

                    riderCode:
                        rider.riderCode,

                    verificationStatus:
                        rider.verificationStatus,

                    status:
                        rider.status,
                },

            });

        }

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        /*
        |--------------------------------------------------------------------------
        | DUPLICATE
        |--------------------------------------------------------------------------
        */

        if (
            error.code === 11000
        ) {

            return res.status(409).json({
                error:
                    "An account or profile with this information already exists.",
            });

        }

        return res.status(500).json({
            error:
                "Failed to create account.",
        });

    }
});

export default handler;
