import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    val_id: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      enum: ['BDT', 'USD', 'EUR', 'GBP'],
      default: 'BDT'
    },
    paymentMethod: {
      type: String,
      required: true
      // enum: ['SSLCommerz', 'Stripe', 'PayPal', 'BankTransfer']
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    bankTransactionId: {
      type: String
    },
    cardType: {
      type: String
    },
    cardIssuer: {
      type: String
    },
    cardBrand: {
      type: String
    },
    cardIssuerCountry: {
      type: String
    },
    riskLevel: {
      type: String
    },
    riskTitle: {
      type: String
    },
    refund: {
      status: {
        type: String,
        // enum: ['pending', 'processed', 'failed', 'none'],
        default: 'none'
      },
      amount: {
        type: Number,
        default: 0
      },
      refundDate: {
        type: Date
      },
      reason: {
        type: String
      },
      refundRefId: {
        type: String
      }
    }
  },
  { timestamps: true }
)

paymentSchema.index({ orderId: 1 })
paymentSchema.index({ paymentStatus: 1, createdAt: -1 })
paymentSchema.index({ createdAt: -1 })

const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

  
export default Payment
