import db from "@/database/connection";
import User from "@/database/model/User";
import Doctor from "@/database/model/Doctor";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.get(async (req, res) => {
    try {
        await db.connect();

        /*
        |--------------------------------------------------------------------------
        | FIND EXISTING DOCTORS
        |--------------------------------------------------------------------------
        */

        const users =
            await User.find({
                role: "doctor",
            }).lean();


        let created = 0;
        let skipped = 0;
        let failed = 0;

        const results = [];


        /*
        |--------------------------------------------------------------------------
        | MIGRATE
        |--------------------------------------------------------------------------
        */

        for (const user of users) {

            try {

                /*
                |--------------------------------------------------------------------------
                | CHECK EXISTING DOCTOR PROFILE
                |--------------------------------------------------------------------------
                */

                const existingDoctor =
                    await Doctor.findOne({
                        user: user._id,
                    });

                if (existingDoctor) {

                    skipped++;

                    results.push({
                        userId:
                            user._id.toString(),

                        name:
                            user.fullName ||
                            `${user.firstName || ""} ${user.lastName || ""}`.trim(),

                        status:
                            "skipped",

                        reason:
                            "Doctor profile already exists.",

                        doctorId:
                            existingDoctor._id.toString(),

                    });

                    continue;
                }


                /*
                |--------------------------------------------------------------------------
                | CREATE DOCTOR PROFILE
                |--------------------------------------------------------------------------
                */

                const doctor =
                    await Doctor.create({

                        user:
                            user._id,

                        /*
                        | Professional information
                        */

                        bmdcNumber:
                            user.bmdcNumber ||
                            "",

                        speciality:
                            user.speciality ||
                            "",

                        education:
                            user.education ||
                            "",

                        workingIn:
                            user.workingIn ||
                            "",

                        totalExperience:
                            Number(
                                user.totalExperience ||
                                0
                            ),

                        experienceDetails:
                            user.experienceDetails ||
                            "",

                        about:
                            user.about ||
                            "",

                        departments:
                            Array.isArray(
                                user.departments
                            )
                                ? user.departments
                                : [],

                        symptoms:
                            Array.isArray(
                                user.symptoms
                            )
                                ? user.symptoms
                                : [],

                        consultationFee:
                            Number(
                                user.consultationFee ||
                                0
                            ),

                        followUpFee:
                            Number(
                                user.followUpFee ||
                                0
                            ),

                        avgConsultationTime:
                            Number(
                                user.avgConsultationTime ||
                                30
                            ),

                        patientAttended:
                            Number(
                                user.patientAttended ||
                                0
                            ),

                        /*
                        | Verification
                        */

                        isVerified:
                            Boolean(
                                user.isVerified
                            ),

                        verificationStatus:
                            user.isVerified
                                ? "verified"
                                : "pending",

                        /*
                        | Existing doctors are assumed
                        | active if already verified.
                        */

                        status:
                            user.isVerified
                                ? "active"
                                : "inactive",

                    });


                created++;

                results.push({
                    userId:
                        user._id.toString(),

                    name:
                        user.fullName ||
                        `${user.firstName || ""} ${user.lastName || ""}`.trim(),

                    status:
                        "created",

                    doctorId:
                        doctor._id.toString(),

                });

            } catch (error) {

                failed++;

                results.push({
                    userId:
                        user._id.toString(),

                    name:
                        user.fullName ||
                        `${user.firstName || ""} ${user.lastName || ""}`.trim(),

                    status:
                        "failed",

                    reason:
                        error.message,

                });

            }

        }


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return res.status(200).json({

            success: true,

            message:
                "Doctor migration completed.",

            summary: {

                totalUsers:
                    users.length,

                created,

                skipped,

                failed,

            },

            results,

        });

    } catch (error) {

        console.error(
            "Doctor migration error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to migrate doctor data.",

            error:
                error.message,

        });

    }
});

export default handler;