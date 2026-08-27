import mongoose from "mongoose";


const MedicineSchema = new mongoose.Schema(

    {
        /*
        |--------------------------------------------------------------------------
        | BASIC INFORMATION
        |--------------------------------------------------------------------------
        */

        code: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },


        name: {
            type: String,
            required: true,
            trim: true,
        },


        genericName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },


        strength: {
            type: String,
            trim: true,
            default: "",
        },


        dosageForm: {
            type: String,
            enum: [
                "Tablet",
                "Capsule",
                "Syrup",
                "Suspension",
                "Injection",
                "Cream",
                "Ointment",
                "Drops",
                "Inhaler",
                "Powder",
                "Other",
            ],
            default: "Tablet",
        },


        packSize: {
            type: String,
            trim: true,
            default: "",
        },


        manufacturer: {
            type: String,
            trim: true,
            default: "",
            index: true,
        },


        category: {
            type: String,
            trim: true,
            default: "Other",
            index: true,
        },
        sourceBrandId: {
            type: Number,
            index: true
        },

        sourceSlug: {
            type: String,
            index: true,
            trim: true
        },

        medicineType: {
            type: String,
            trim: true,
            default: ''
        },

        /*
        |--------------------------------------------------------------------------
        | PRICING
        |--------------------------------------------------------------------------
        */

        price: {
            type: Number,
            required: true,
            min: 0,
        },


        /*
        |--------------------------------------------------------------------------
        | INVENTORY
        |--------------------------------------------------------------------------
        */

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },


        reorderLevel: {
            type: Number,
            default: 20,
            min: 0,
        },


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        prescriptionRequired: {
            type: Boolean,
            default: false,
            index: true,
        },


        /*
        |--------------------------------------------------------------------------
        | PRODUCT INFORMATION
        |--------------------------------------------------------------------------
        */

        description: {
            type: String,
            trim: true,
            default: "",
        },


        usage: {
            type: String,
            trim: true,
            default: "",
        },


        warnings: {
            type: String,
            trim: true,
            default: "",
        },


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        | Keeping this as an object gives you room for Cloudinary/Firebase/etc.
        |--------------------------------------------------------------------------
        */

        image: {
            url: {
                type: String,
                trim: true,
                default: "",
            },

            publicId: {
                type: String,
                trim: true,
                default: "",
            },
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
            ],
            default: "active",
            index: true,
        },


        /*
        |--------------------------------------------------------------------------
        | OPTIONAL ADMIN INFORMATION
        |--------------------------------------------------------------------------
        */

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },


        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

    },

    {
        timestamps: true,
    }

);


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

MedicineSchema.index({
    name: "text",
    genericName: "text",
    manufacturer: "text",
    code: "text",
});


MedicineSchema.index({
    category: 1,
    status: 1,
});


MedicineSchema.index({
    prescriptionRequired: 1,
    status: 1,
});


/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

/*
 * Low-stock status
 *
 * Example:
 *
 * stock = 18
 * reorderLevel = 25
 *
 * => low stock
 */

MedicineSchema.virtual(
    "stockStatus"
).get(function () {

    if (this.stock <= 0) {

        return "out_of_stock";

    }


    if (
        this.stock <=
        this.reorderLevel
    ) {

        return "low_stock";

    }


    return "in_stock";

});


MedicineSchema.set(
    "toJSON",
    {
        virtuals: true,
    }
);


MedicineSchema.set(
    "toObject",
    {
        virtuals: true,
    }
);


export default
    mongoose.models.Medicine ||
    mongoose.model(
        "Medicine",
        MedicineSchema
    );