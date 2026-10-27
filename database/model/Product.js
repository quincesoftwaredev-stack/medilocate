import { generateUniqueID } from '@/utility/helper'
import { ExtractColors } from '@/utility/image';
import mongoose from 'mongoose'

// Define Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Ensures unique product URLs
      trim: true
    },
    description: {
      type: String
    },
    featured: {
      type: Boolean,
      default: false
    },
    ratings: { type: Number },
    totalRatings:{type:Number},
    ratingCount:{type:Number},
    sizes: { type: String },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      defautl: 0
    },
    priceWithDiscount: {
      type: Number,
      required: true
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    colors: { type: Array },
    // Media and content
    images: [
      {
        image: {
          type: String
        },
        colors: {
          type: Array,
          default: ["#FFFFFF00", "#FFFFFF00", "#FFFFFF00", "#FFFFFF00", "#FFFFFF00", "#FFFFFF00"]
        },
        uid: {
          type: String,
        },
        color: {
          type: String
        }
      }
    ],
    thumbnail: {
      type: String,
      required: true
    },

    thumbnailColors: {
      type: Array,
      default: ["#FFFFFF00", "#FFFFFF00", "#FFFFFF00", "#FFFFFF00", "#FFFFFF00", "#FFFFFF00"]
    },

    // SEO and visibility
    metaTitle: {
      type: String
    },
    metaDescription: {
      type: String
    },

    // Additional attributes
    attributes: [
      {
        name: {
          type: String
        },
        value: {
          type: String
        },
        uid: {
          type: String,
        }
      }
    ],

    stockQuantity: {
      type: Number,
      default: 0,
      required: true
    },
    sold: {
      type: Number,
      default: 0,
      required: true
    },
    video: {
      type: String,

    }
  },
  { timestamps: true }
)

productSchema.index({ featured: 1, createdAt: -1 })
productSchema.index({ categories: 1, createdAt: -1 })
productSchema.index({ sold: -1 })
productSchema.index({ createdAt: -1 })





// Create Model
const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema)
export default Product
