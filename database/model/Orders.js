import mongoose from "mongoose";


/*
|--------------------------------------------------------------------------
| STATUS VALUES
|--------------------------------------------------------------------------
*/

const ORDER_STATUSES = [

    "pending",

    "preparing",

    "ready",

    "assigned",

    "out_for_delivery",

    "delivered",

    "cancelled",

    "failed",

];


const orderItemSchema = new mongoose.Schema(

    {

        medicine: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "Medicine",

            required: true,

        },


        quantity: {

            type: Number,

            required: true,

            min: 1,

        },


        /*
         * Price at the time the order
         * was placed.
         */

        unitPrice: {

            type: Number,

            required: true,

            min: 0,

        },

    },

    {
        _id: false
    }

);


const statusHistorySchema =
    new mongoose.Schema(

        {

            status: {

                type: String,

                enum: ORDER_STATUSES,

                required: true,

            },


            timestamp: {

                type: Date,

                default: Date.now,

            },


            note: {

                type: String,

                default: "",

                trim: true,

            },

        },

        {
            _id: false
        }

    );


const orderSchema = new mongoose.Schema(

    {

        /*
        |--------------------------------------------------------------------------
        | TRACKING NUMBER
        |--------------------------------------------------------------------------
        */

        trackingNumber: {

            type: String,

            required: true,

            unique: true,

            index: true,

            trim: true,

        },


        /*
        |--------------------------------------------------------------------------
        | CUSTOMER
        |--------------------------------------------------------------------------
        */

        user: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: false,

        },


        /*
        |--------------------------------------------------------------------------
        | ORDER ITEMS
        |--------------------------------------------------------------------------
        */

        items: {

            type: [orderItemSchema],

            required: true,

            validate: {

                validator: function (items) {

                    return (
                        Array.isArray(items) &&
                        items.length > 0
                    );

                },

                message:
                    "Order must contain at least one item.",

            },

        },


        /*
        |--------------------------------------------------------------------------
        | DELIVERY
        |--------------------------------------------------------------------------
        */

        delivery: {

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

                required: true,

                trim: true,

            },

        },


        /*
        |--------------------------------------------------------------------------
        | PAYMENT
        |--------------------------------------------------------------------------
        */

        paymentMethod: {

            type: String,

            enum: [

                "cod",

                "online"

            ],

            default: "cod",

        },


        paymentStatus: {

            type: String,

            enum: [

                "pending",

                "paid",

                "failed",

                "refunded"

            ],

            default: "pending",

        },


        /*
        |--------------------------------------------------------------------------
        | CURRENT ORDER STATUS
        |--------------------------------------------------------------------------
        */

        status: {

            type: String,

            enum: ORDER_STATUSES,

            default: "pending",

            index: true,

        },


        /*
        |--------------------------------------------------------------------------
        | STATUS HISTORY
        |--------------------------------------------------------------------------
        */

        statusHistory: {

            type: [statusHistorySchema],

            default: [],

        },


        /*
        |--------------------------------------------------------------------------
        | PRESCRIPTION
        |--------------------------------------------------------------------------
        */

        prescription: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "Prescription",

            default: null,

        },


        /*
        |--------------------------------------------------------------------------
        | AMOUNTS
        |--------------------------------------------------------------------------
        */

        subtotal: {

            type: Number,

            required: true,

            min: 0,

        },


        deliveryFee: {

            type: Number,

            required: true,

            min: 0,

        },


        total: {

            type: Number,

            required: true,

            min: 0,

        },


        /*
        |--------------------------------------------------------------------------
        | CUSTOMER NOTE
        |--------------------------------------------------------------------------
        */

        notes: {

            type: String,

            trim: true,

            default: "",

        },
        internalNote: {
            type: String,
            trim: true,
            default: "",
            required: false,
        },

    },

    {

        timestamps: true,

    }

);


export default mongoose.models.Order ||
    mongoose.model(
        "Order",
        orderSchema
    );