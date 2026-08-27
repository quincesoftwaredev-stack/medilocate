import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
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
        | RIDER ID
        |--------------------------------------------------------------------------
        */

        riderCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },


        /*
        |--------------------------------------------------------------------------
        | VEHICLE
        |--------------------------------------------------------------------------
        */

        vehicleType: {
            type: String,
            enum: [
                "bicycle",
                "motorcycle",
                "scooter",
                "car",
                "other",
            ],
            default: "motorcycle",
        },

        vehicleNumber: {
            type: String,
            trim: true,
            default: "",
        },


        /*
        |--------------------------------------------------------------------------
        | SERVICE AREA
        |--------------------------------------------------------------------------
        */

        serviceAreas: [
            {
                type: String,
                trim: true,
            },
        ],


        /*
        |--------------------------------------------------------------------------
        | LOCATION
        |--------------------------------------------------------------------------
        */

        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },


        /*
        |--------------------------------------------------------------------------
        | AVAILABILITY
        |--------------------------------------------------------------------------
        */

        isAvailable: {
            type: Boolean,
            default: false,
            index: true,
        },


        /*
        |--------------------------------------------------------------------------
        | DELIVERY STATISTICS
        |--------------------------------------------------------------------------
        */

        completedDeliveries: {
            type: Number,
            min: 0,
            default: 0,
        },

        cancelledDeliveries: {
            type: Number,
            min: 0,
            default: 0,
        },


        /*
        |--------------------------------------------------------------------------
        | VERIFICATION
        |--------------------------------------------------------------------------
        */

        verificationStatus: {
            type: String,
            enum: [
                "pending",
                "verified",
                "rejected",
            ],
            default: "pending",
            index: true,
        },

        verifiedAt: {
            type: Date,
            default: null,
        },


        /*
        |--------------------------------------------------------------------------
        | STATUS
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


        /*
        |--------------------------------------------------------------------------
        | NOTE
        |--------------------------------------------------------------------------
        */

        note: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);


riderSchema.index({
    currentLocation: "2dsphere",
});


export default mongoose.models.Rider ||
    mongoose.model(
        "Rider",
        riderSchema
    );