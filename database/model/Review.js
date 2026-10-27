import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // Textual content of the review
  content: {
    type: String,
    // required: true
  },

  // Can include an array of image/video URLs for attachments
  attachments: [
    {
      type: String,
    }
  ],
  name: {
    type: String,
  },
  email: {
    type: String,
  },


},
  { timestamps: true })

reviewSchema.index({ product: 1, createdAt: -1 })

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)
export default Review
