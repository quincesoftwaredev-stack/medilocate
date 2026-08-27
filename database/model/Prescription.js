import mongoose from "mongoose";

const PRESCRIPTION_STATUSES = [
    "pending",
    "reviewing",
    "medicines_identified",
    "order_created",
    "completed",
    "cancelled",
    "rejected",
];

const prescriptionFileSchema =
    new mongoose.Schema(
        {
            url: {
                type: String,
                required: true,
                trim: true,
            },

            publicId: {
                type: String,
                default: "",
                trim: true,
            },

            name: {
                type: String,
                default: "",
                trim: true,
            },

            type: {
                type: String,
                default: "",
                trim: true,
            },

            size: {
                type: Number,
                default: 0,
                min: 0,
            },
        },
        {
            _id: false,
        }
    );

const prescriptionMedicineSchema =
    new mongoose.Schema(
        {
            medicine: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Medicine",
                default: null,
            },

            prescribedName: {
                type: String,
                required: true,
                trim: true,
            },

            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },

            status: {
                type: String,
                enum: [
                    "identified",
                    "uncertain",
                    "unavailable",
                ],
                default: "identified",
            },

            note: {
                type: String,
                trim: true,
                default: "",
            },
        }
    );

const statusHistorySchema =
    new mongoose.Schema(
        {
            status: {
                type: String,
                enum: PRESCRIPTION_STATUSES,
                required: true,
            },

            timestamp: {
                type: Date,
                default: Date.now,
            },

            note: {
                type: String,
                trim: true,
                default: "",
            },
        },
        {
            _id: false,
        }
    );

const prescriptionSchema =
    new mongoose.Schema(
        {
            requestCode: {
                type: String,
                required: true,
                unique: true,
                index: true,
                trim: true,
            },

            user: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            patient: {
                name: {
                    type: String,
                    required: true,
                    trim: true,
                },

                phone: {
                    type: String,
                    required: true,
                    trim: true,
                },

                address: {
                    type: String,
                    required: true,
                    trim: true,
                },

                city: {
                    type: String,
                    default: "",
                    trim: true,
                },
            },

            files: {
                type: [prescriptionFileSchema],
                required: true,

                validate: {
                    validator: function (files) {
                        return (
                            Array.isArray(files) &&
                            files.length > 0
                        );
                    },

                    message:
                        "Prescription must contain at least one file.",
                },
            },

            notes: {
                type: String,
                trim: true,
                default: "",
            },

            medicines: {
                type: [prescriptionMedicineSchema],
                default: [],
            },

            status: {
                type: String,
                enum: PRESCRIPTION_STATUSES,
                default: "pending",
                index: true,
            },

            statusHistory: {
                type: [statusHistorySchema],
                default: [],
            },

            order: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Order",
                default: null,
            },

            reviewedBy: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },

            reviewedAt: {
                type: Date,
                default: null,
            },

            reviewNote: {
                type: String,
                trim: true,
                default: "",
            },

            internalNote: {
                type: String,
                trim: true,
                default: "",
            },
        },
        {
            timestamps: true,
        }
    );

export default mongoose.models.Prescription ||
    mongoose.model(
        "Prescription",
        prescriptionSchema
    );