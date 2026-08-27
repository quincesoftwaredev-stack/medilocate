import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        /*
        |--------------------------------------------------------------------------
        | SUPPLIER CODE
        |--------------------------------------------------------------------------
        */

        supplierCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },


        /*
        |--------------------------------------------------------------------------
        | BUSINESS INFORMATION
        |--------------------------------------------------------------------------
        */

        name: {
            type: String,
            required: true,
            trim: true,
        },

        businessName: {
            type: String,
            trim: true,
            default: "",
        },

        licenseNumber: {
            type: String,
            trim: true,
            default: "",
        },


        /*
        |--------------------------------------------------------------------------
        | CONTACT PERSON
        |--------------------------------------------------------------------------
        */

        contactPerson: {
            type: String,
            trim: true,
            default: "",
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        alternatePhone: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },


        /*
        |--------------------------------------------------------------------------
        | ADDRESS
        |--------------------------------------------------------------------------
        */

        address: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            trim: true,
            default: "",
        },


        /*
        |--------------------------------------------------------------------------
        | SUPPLIED MEDICINES
        |--------------------------------------------------------------------------
        */

        medicines: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Medicine",
            },
        ],


        /*
        |--------------------------------------------------------------------------
        | PAYMENT
        |--------------------------------------------------------------------------
        */

        paymentTerms: {
            type: String,
            trim: true,
            default: "",
        },

        dueAmount: {
            type: Number,
            min: 0,
            default: 0,
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
        | NOTES
        |--------------------------------------------------------------------------
        */

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.models.Supplier ||
    mongoose.model(
        "Supplier",
        supplierSchema
    );