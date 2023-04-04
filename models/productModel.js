const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({




    product: {
        type: String,
        required: true,
    },
    Category: {

        type: mongoose.Schema.Types.String,
        required: true,
        ref:'Category'
    },
    Description: {
        type: String,
        required: true,
    },
    Stock: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },
    show: {
        type: Boolean,
        default: true,
    }


})



module.exports = mongoose.model('Product',productSchema);