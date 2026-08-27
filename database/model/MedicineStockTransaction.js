import mongoose from "mongoose";


const MedicineStockTransactionSchema =
    new mongoose.Schema(

        {
            medicine: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Medicine",
                required: true,
                index: true,
            },


            type: {
                type: String,
                enum: [
                    "purchase",
                    "sale",
                    "adjustment",
                    "return",
                    "damaged",
                    "expired",
                    "correction",
                ],
                required: true,
            },


            quantity: {
                type: Number,
                required: true,
                min: 1,
            },


            previousStock: {
                type: Number,
                required: true,
                min: 0,
            },


            newStock: {
                type: Number,
                required: true,
                min: 0,
            },


            reason: {
                type: String,
                trim: true,
                default: "",
            },


            referenceType: {
                type: String,
                enum: [
                    "order",
                    "manual",
                    "purchase",
                    "return",
                    "system",
                ],
                default: "manual",
            },


            referenceId: {
                type:
                    mongoose.Schema.Types.ObjectId,
                default: null,
            },


            createdBy: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
        },

        {
            timestamps: true,
        }
    );


MedicineStockTransactionSchema.index({
    medicine: 1,
    createdAt: -1,
});


export default
    mongoose.models.MedicineStockTransaction ||
    mongoose.model(
        "MedicineStockTransaction",
        MedicineStockTransactionSchema
    );