import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            // unique: true
        },

        slug: {
            // URL friendly identifier
            type: String,
            required: true,
            trim: true,
            // unique: true // Ensures unique department URLs
        },

        image: {
            type: String
        },

        isShown: {
            type: Boolean,
            default: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
)

departmentSchema.index({ isFeatured: 1, isShown: 1 })
departmentSchema.index({ createdAt: -1 })

// Create Model
const Department =
    mongoose.models.Department || mongoose.model('Department', departmentSchema)
export default Department
