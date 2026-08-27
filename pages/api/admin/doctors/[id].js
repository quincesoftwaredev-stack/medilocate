import db from "@/database/connection";
import Doctor from "@/database/model/Doctor";
import User from "@/database/model/User";
import nextConnect from "next-connect";

const handler = nextConnect();

handler.patch(async (req, res) => {

    try {

        await db.connect();

        const {
            id,
        } = req.query;

        const {
            verificationStatus,
            note = "",
        } = req.body;

        const allowedStatuses = [
            "pending",
            "verified",
            "rejected",
        ];

        if (
            !allowedStatuses.includes(
                verificationStatus
            )
        ) {

            return res.status(400).json({
                error:
                    "Invalid verification status.",
            });

        }

        const doctor =
            await Doctor.findById(id);

        if (!doctor) {

            return res.status(404).json({
                error:
                    "Doctor not found.",
            });

        }

        doctor.verificationStatus =
            verificationStatus;

        doctor.isVerified =
            verificationStatus ===
            "verified";

        doctor.status =
            verificationStatus ===
            "verified"
                ? "active"
                : verificationStatus ===
                  "rejected"
                ? "inactive"
                : "inactive";

        if (note) {
            doctor.about =
                doctor.about;
        }

        await doctor.save();


        /*
        |--------------------------------------------------------------------------
        | USER ACCOUNT
        |--------------------------------------------------------------------------
        */

        await User.findByIdAndUpdate(
            doctor.user,
            {
                isVerified:
                    verificationStatus ===
                    "verified",
            }
        );


        return res.status(200).json({
            success: true,
            message:
                `Doctor ${verificationStatus}.`,
            doctor,
        });

    } catch (error) {

        console.error(
            "Doctor verification error:",
            error
        );

        return res.status(500).json({
            error:
                "Failed to update doctor verification.",
        });

    }

});

export default handler;