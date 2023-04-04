const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
        
      
    },
    referralCount: {
        type: Number,
        default: 0
      },
    referredUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    is_admin: {
        type: Number,
        required: true
    },
    is_active: {
        type: Boolean,
        default:true
    },
    wishlist: [{
        products: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required:true
        }
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
        },
        prototalprice: {
            type: Number,
            required: true,
            
        },
        
    }],
    
    cartTotalPrice: {
        type: Number,
        default:0
    },
    Address: [{
        name: {
            type: String,
            required:true
        },
        address: {
            type: String,
            required:true
        },
        postcode: {
            type: Number,
            required:true
        },
        state: {
            type: String,
            required:true
        },
        town: {
            type: String,
            required:true
        },
        contactnumber: {
            type: Number,
            required:true
        },
        landmark: {
            type:String
        }
    }

    ]



})
module.exports = mongoose.model('User', userSchema);
