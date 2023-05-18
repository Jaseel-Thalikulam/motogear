const mongoose = require('mongoose')
const { v4: uuidv4 } = require("uuid")

const orderschema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderId: {

        type: String,
        unique: true,
        required: true,

    },
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User.Address',
        required: true,

    },
    date: {
        type: Date,
        default: Date
    },
    product: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true
        },
        singleTotal: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            default: "order placed"
        },
        deliveredDate: {
            type: Date,
            required: false
        }


    }],

    total: {
        type: Number
    },
    discount: {
        type: Number
    },
    paymentType: {
        type: String,
        required: true
    },




})




module.exports = mongoose.model('Order', orderschema)
