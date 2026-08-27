import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        bmdcNumber: {
            type: String,
            trim: true,
            default: "",
        },

        departments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Department",
            },
        ],

        speciality: {
            type: String,
            trim: true,
            default: "",
        },

        education: {
            type: String,
            trim: true,
            default: "",
        },

        workingIn: {
            type: String,
            trim: true,
            default: "",
        },

        consultationFee: {
            type: Number,
            min: 0,
            default: 0,
        },

        followUpFee: {
            type: Number,
            min: 0,
            default: 0,
        },

        avgConsultationTime: {
            type: Number,
            min: 0,
            default: 30,
        },

        totalExperience: {
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

        symptoms: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Symptom",
            },
        ],

        patientAttended: {
            type: Number,
            min: 0,
            default: 0,
        },

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

        availableForHomeVisit: {
            type: Boolean,
            default: true,
        },

        availableForOnline: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: [
                "active",
                "inactive",
                "suspended",
            ],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Doctor ||
    mongoose.model(
        "Doctor",
        doctorSchema
    );