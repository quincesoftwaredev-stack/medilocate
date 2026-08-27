import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema(
    {
        /*
        |--------------------------------------------------------------------------
        | USER
        |--------------------------------------------------------------------------
        */

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },


        /*
        |--------------------------------------------------------------------------
        | PROFESSIONAL INFORMATION
        |--------------------------------------------------------------------------
        */

        registrationNumber: {
            type: String,
            trim: true,
            default: "",
        },

        qualification: {
            type: String,
            trim: true,
            default: "",
        },

        specialization: {
            type: String,
            trim: true,
            default: "",
        },

        institution: {
            type: String,
            trim: true,
            default: "",
        },

        experience: {
            type: Number,
            min: 0,
            default: 0,
        },

        experienceDetails: {
            type: String,
            trim: true,
            default: "",
        },

        about: {
            type: String,
            trim: true,
            default: "",
        },


        /*
        |--------------------------------------------------------------------------
        | SERVICES
        |--------------------------------------------------------------------------
        */

        services: [
            {
                type: String,
                trim: true,
            },
        ],

        availableForHomeVisit: {
            type: Boolean,
            default: true,
        },

        availableForHospital: {
            type: Boolean,
            default: false,
        },


        /*
        |--------------------------------------------------------------------------
        | FEES
        |--------------------------------------------------------------------------
        */

        consultationFee: {
            type: Number,
            min: 0,
            default: 0,
        },

        homeVisitFee: {
            type: Number,
            min: 0,
            default: 0,
        },


        /*
        |--------------------------------------------------------------------------
        | PERFORMANCE
        |--------------------------------------------------------------------------
        */

        patientAttended: {
            type: Number,
            min: 0,
            default: 0,
        },


        /*
        |--------------------------------------------------------------------------
        | VERIFICATION
        |--------------------------------------------------------------------------
        */

        isVerified: {
            type: Boolean,
            default: false,
        },

        verificationStatus: {
            type: String,
            enum: [
                "pending",
                "verified",
                "rejected",
            ],
            default: "pending",
        },


        /*
        |--------------------------------------------------------------------------
        | ACCOUNT / PROFILE STATUS
        |--------------------------------------------------------------------------
        */

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "suspended",
            ],
            default: "active",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.models.Nurse ||
    mongoose.model(
        "Nurse",
        nurseSchema
    );