import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    calculationMethod: { type: String, enum: ["capacity", "duration"], default: "duration" },
    slotDurationMinutes: { type: Number, min: 5, max: 240, default: 30 },
    maxPatientsPerWindow: { type: Number, min: 1, default: 1 },
    bufferMinutes: { type: Number, min: 0, max: 120, default: 0 },
    maxPatientsPerSlot: { type: Number, min: 1, default: 1 },
    consultationMode: { type: String, enum: ["chamber", "online", "home-visit"], default: "chamber" },
    chamberId: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { _id: true });

const weeklyAvailabilitySchema = new mongoose.Schema({
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    isAvailable: { type: Boolean, default: true },
    slots: { type: [timeSlotSchema], default: [] },
}, { _id: false });

const chamberSchema = new mongoose.Schema({
    name: { type: String, trim: true, required: true },
    address: { type: String, trim: true, required: true },
    city: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
}, { _id: true });

const unavailablePeriodSchema = new mongoose.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, trim: true, default: "" },
    allDay: { type: Boolean, default: true },
}, { _id: true });

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

        designation: { type: String, trim: true, default: "" },

        languages: { type: [String], default: [] },

        chambers: { type: [chamberSchema], default: [] },

        weeklyAvailability: { type: [weeklyAvailabilitySchema], default: [] },

        unavailablePeriods: { type: [unavailablePeriodSchema], default: [] },

        bookingSettings: {
            advanceBookingDays: { type: Number, min: 0, max: 365, default: 30 },
            minimumNoticeMinutes: { type: Number, min: 0, default: 60 },
            cancellationNoticeMinutes: { type: Number, min: 0, default: 120 },
            maxPatientsPerDay: { type: Number, min: 1, default: 30 },
            autoConfirmBookings: { type: Boolean, default: false },
            maxReschedules: { type: Number, min: 0, max: 10, default: 2 },
        },

        platformFeePercent: { type: Number, min: 0, max: 100, default: 0 },

        payoutDetails: {
            method: { type: String, enum: ["bkash", "nagad", "bank", ""], default: "" },
            accountName: { type: String, trim: true, default: "" },
            accountNumber: { type: String, trim: true, default: "" },
            verified: { type: Boolean, default: false },
        },

        consultationModes: {
            chamber: { enabled: { type: Boolean, default: true }, fee: { type: Number, min: 0, default: 0 } },
            online: { enabled: { type: Boolean, default: false }, fee: { type: Number, min: 0, default: 0 } },
            homeVisit: { enabled: { type: Boolean, default: false }, fee: { type: Number, min: 0, default: 0 } },
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
