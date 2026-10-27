import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
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
      // unique: true // Ensures unique category URLs
    },

    image: {
      type: String
    },
    // Optional fields for hierarchical categories
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category' // Reference to itself for parent category
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category' // Reference to itself for child categories
      }
    ],
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

categorySchema.index({ parent: 1 })
categorySchema.index({ isFeatured: 1, isShown: 1 })
categorySchema.index({ createdAt: -1 })

// Create Model
const Category =
  mongoose.models.Category || mongoose.model('Category', categorySchema)
export default Category
