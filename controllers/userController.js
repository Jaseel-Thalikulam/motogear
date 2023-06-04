const User = require('../models/userModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Coupon = require('../models/couponModel');
const Banner = require('../models/bannerModel');
// const userModel = require('../models/userModel');
// const { findOne } = require('../models/userModel');

const { v4: uuidv4 } = require("uuid")
var instance = new Razorpay({
    key_id: "rzp_test_D942aLuHV8JR0P",
    key_secret: "kkR628vPxfE2CHh9bHozVGvv",
});



require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require("twilio")(accountSid, authToken);


const loadorderplaced = async (req, res) => {
    try {
        const categorydata = await Category.find({})
        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })


        const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();

        const order = await Order.findOne({ _id: latestOrder._id }).populate("product.productId");
        for (let i = 0; i < order.product.length; i++) {
            await Product.updateOne(
                { _id: order.product[i].productId },
                { $inc: { Stock: - order.product[i].quantity } }
            );
        }



        res.render('orderplaced', { user: userdata, categories: categorydata })

    } catch (err) {
        console.log(err)
        res.render('404')
    }

}

const loadreferals_coupons = async (req, res) => {
    try {

        let user = req.session.user
        const userData = await User.findOne({ _id: user._id })
        const UserCoupon = await Coupon.find({ referrer: userData._id })
        const Coupons = await Coupon.find({ referrer: null })
        console.log(Coupons)

        res.render('coupons_referals', { userData: userData, user: user, UserCoupon: UserCoupon, Coupons: Coupons })

    } catch (err) {
        console.log(err)
        res.render('404')
    }
}

const loadcheckoutaddaddress = async (req, res) => {
    try {
        const categorydata = await Category.find({})
        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        res.render('add_address', { user: userdata, categories: categorydata })
    } catch (err) {
        console.log(err)
        res.render('404')
    }
}

const changePassword = async (req, res) => {
    try {
        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        res.render('profilechangePassword', { user: userdata })

    } catch (err) {
        console.log(err)
    }
}

const changePasswordpost = async (req, res) => {
    try {

        const currentpassword = req.body.currentpassword
        const newpassword = req.body.newpassword
        const confirmPassword = req.body.confirmpassword

        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })

        console.log(currentpassword)
        console.log(newpassword)
        console.log(confirmPassword)

        const passwordMatch = await bcrypt.compare(currentpassword, userdata.password)

        if (passwordMatch) {
            console.log(passwordMatch)

            if (newpassword == confirmPassword) {
                console.log("password confirmed")
                const newhashpassword = await securePassword(newpassword)
                const userdata = req.session.user
                console.log(user.mobile)

                const found = await User.updateOne({ mobile: user.mobile }, {
                    $set: {
                        password: newhashpassword
                    }
                })

                if (found) {
                    console.log(found)
                    res.redirect('/')
                }

            }

        } else {


        }




    } catch (err) {
        console.log(err)
    }
}

const loadWishlist = async (req, res) => {
    try {
        const categorydata = await Category.find({})
        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        const wishlistdata = await User.findOne({ _id: userdata._id }).populate('wishlist.products')
        res.render('wishlist', { user: userdata, categories: categorydata, wishlistData: wishlistdata })
    } catch (err) {
        console.log(err)

    }
}

const loadCart = async (req, res) => {
    try {

        const categorydata = await Category.find({})


        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        const cartData = await User.findOne({ _id: userdata._id }).populate('cart.product')

        res.render('cart', { user: userdata, categories: categorydata, cartData: cartData })
    } catch (error) {
        console.log(error.message);
    }
}



const verifyPayment = async (req, res) => {
    try {
        let userId = req.session.user;
        const details = req.body;
        let hmac = crypto.createHmac("sha256", "kkR628vPxfE2CHh9bHozVGvv");

        hmac.update(
            details.payment.razorpay_order_id +
            "|" +
            details.payment.razorpay_payment_id
        );
        hmac = hmac.digest("hex");

        if (hmac == details.payment.razorpay_signature) {
            const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();

            console.log("called latestOrder")

            const change = await Order.updateOne(
                { _id: latestOrder._id },
                { $set: { 'product.$[].status': 'Order Confirmed' } }
            );

            console.log(change);


            for (let i = 0; i < latestOrder.product.length; i++) {
                const productId = latestOrder.product[i].productId;

                const user = req.session.user

                const found = await User.updateOne({ _id: user._id }, { $pull: { cart: { product: productId } } })

            }

            //   const cartData = await Cart.updateOne(
            //     { userId: userId },
            //     { $pull: { products: { productId } } }
            //     );






            res.json({ status: true });
            if (change) {
            }
        } else {

            const change = await Order.updateOne(
                { _id: latestOrder._id },
                { $set: { status: "Payment failed" } }
            );
            console.log("Fail");
            res.json({ failed: true });
        }
    } catch (err) {
        console.log(err);
        //   res.render("500");
    }
};

const placeorder = async (req, res) => {
    try {



        const id = req.session.user._id

        const productpush = []
        const orderdata = req.body


        if (!Array.isArray(orderdata.ProductId)) {
            orderdata.ProductId = [orderdata.ProductId]
        }
        if (!Array.isArray(orderdata.quantity)) {
            orderdata.quantity = [orderdata.quantity]
        }
        if (!Array.isArray(orderdata.singleTotal)) {
            orderdata.singleTotal = [orderdata.singleTotal]
        }

        for (let i = 0; i < orderdata.ProductId.length; i++) {
            let productId = orderdata.ProductId[i]
            let quantitys = orderdata.quantity[i]
            let singleTotals = orderdata.singleTotal[i]
            productpush.push({ productId: productId, quantity: quantitys, singleTotal: singleTotals })

        }


        //status updation

        // const status = req.body.payment == "COD" ? "Confirmed" : "Pending"

        if (req.body.payment == "COD") {
            const order = new Order({

                userId: req.session.user._id,
                deliveryAddress: req.body.address,
                product: productpush,
                total: req.body.total,
                paymentType: req.body.payment,
                discount: req.body.discount,

                orderId: `orderId_${uuidv4()}`




            })


            const neworderdata = await order.save()

            const idpushed = await Coupon.updateOne(
                { code: req.body.code },
                { $push: { userUsed: id } }
            );

            console.log(idpushed)

            const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();
            for (let i = 0; i < latestOrder.product.length; i++) {
                const productId = latestOrder.product[i].productId;

                const user = req.session.user

                const found = await User.updateOne({ _id: user._id }, { $pull: { cart: { product: productId } }, $set: { cartTotalPrice: 0 } })

            }




            // console.log(cartdeletion)

            res.json({ success: true })
        } else if (req.body.payment == "UPI") {
            let status = "pending";
            const order = new Order({

                userId: req.session.user._id,
                deliveryAddress: req.body.address,
                product: productpush,
                total: req.body.total,
                paymentType: req.body.payment,
                discount: req.body.discount,

                orderId: `orderId_${uuidv4()}`




            })

            const saveData = await order.save();
            const idpushed = await Coupon.updateOne(
                { code: req.body.code },
                { $push: { userUsed: id } }
            );

            console.log(idpushed)

            const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();


            //          money=req.body.total * 100,
            // console.log(money)

            let options = {
                amount: req.body.total * 100,

                currency: "INR",
                receipt: "" + latestOrder._id,
            };
            console.log(options)

            instance.orders.create(options, function (err, order) {

                if (order == null) {
                    console.log("Such a whore")
                }

                res.json({ viewRazorpay: true, order });
            });





        }

    } catch (err) {
        console.log(err)
        res.render('404')
    }
}

//user applying coupon
const applyCoupon = async (req, res) => {
    try {
        id = req.session.user._id

        const couponDetails = await Coupon.findOne({ code: req.body.code });



        if (couponDetails) {

            console.log(couponDetails.referrer)
            console.log(id)

            if (couponDetails.referrer == null) {



                const user = await User.findOne({ _id: id });

                const found = await Coupon.findOne({

                    code: req.body.code,

                    userUsed: { $in: [user._id] },
                });




                const code = couponDetails.code;


                const datenow = Date.now();

                if (found) {

                    res.json({ used: true });

                } else {

                    if (datenow <= couponDetails.expirationDate) {

                        if (couponDetails.MinPurchaseAmount <= req.body.total) {

                            let discountAmount =

                                (req.body.total * couponDetails.percentageOff) / 100;

                            if (discountAmount <= couponDetails.maxDiscount) {

                                let discountValue = discountAmount;

                                let value = req.body.total - discountValue;

                                res.json({ amountokay: true, value, discountValue, code });

                            } else {

                                let discountValue = couponDetails.maxDiscount;

                                let value = req.body.total - discountValue;

                                res.json({ amountokay: true, value, discountValue, code });

                            }

                        } else {

                            res.json({ amountnokay: true });

                        }

                    } else {

                        res.json({ datefailed: true });

                    }

                }
            } else if (couponDetails.referrer == id) {

                const user = await User.findOne({ _id: id });

                const found = await Coupon.findOne({

                    code: req.body.code,

                    userUsed: { $in: [user._id] },
                });


                console.log(found)

                const code = couponDetails.code;


                const datenow = Date.now();

                if (found) {

                    res.json({ used: true });

                } else {

                    if (datenow <= couponDetails.expirationDate) {

                        if (couponDetails.MinPurchaseAmount <= req.body.total) {

                            let discountAmount =

                                (req.body.total * couponDetails.percentageOff) / 100;

                            if (discountAmount <= couponDetails.maxDiscount) {

                                let discountValue = discountAmount;

                                let value = req.body.total - discountValue;

                                res.json({ amountokay: true, value, discountValue, code });

                            } else {

                                let discountValue = couponDetails.maxDiscount;

                                let value = req.body.total - discountValue;

                                res.json({ amountokay: true, value, discountValue, code });

                            }

                        } else {

                            res.json({ amountnokay: true });

                        }

                    } else {

                        res.json({ datefailed: true });

                    }

                }






            } else {

                console.log("idh ninde aladaa!")
                res.json({ invalid: true });

            }
        } else {

            res.json({ invalid: true });

        }

    } catch (error) {

        console.log(error.message);

        res.render("500");

    }

};


const addToCart = async (req, res) => {
    try {
        console.log('cart called')
        if (req.session.user) {

            const user = req.session.user
            const ProId = req.body.productId
            const Price = req.body.price
            const Count = 1
            // console.log(user)
            console.log(Price)

            const data = await User.findOne({ _id: user._id, 'cart.product': ProId })

            console.log(data)





            if (data) {
                // res.json({ success: false })

                const UpdatingQuantity = await User.updateOne({ _id: user._id, 'cart.product': ProId }, { $inc: { 'cart.$.quantity': Count } })

                console.log(UpdatingQuantity)


                const UpdatedQuantity
                    = await User.findOne({ _id: user._id, 'cart.product': ProId }, { _id: 0, 'cart.quantity.$': 1 })

                const TotalPrice = await Price * UpdatedQuantity.cart[0].quantity
                console.log(TotalPrice)

                const UpdateTotalPrice = await User.updateOne({ _id: user._id, 'cart.product': ProId }, { $set: { 'cart.$.prototalprice': TotalPrice } })

                //CART TOTAL 
                const cart = await User.findOne({ _id: user._id }).populate('cart.product').exec()
                let sum = 0
                for (let i = 0; i < cart.cart.length; i++) {
                    sum = sum + cart.cart[i].prototalprice
                }

                const cartTotalPrice = await User.updateOne({ _id: user._id }, { $set: { cartTotalPrice: sum } })


                res.json({ success: true, TotalPrice, sum })

            } else {



                const insert = await User.updateOne({ _id: user._id }, { $push: { cart: { product: ProId, prototalprice: Price } } })

                if (insert) {


                    ////updating cart total price


                    const removepdt = await User.updateOne({ _id: user._id }, { $pull: { wishlist: { products: ProId } } })
                    if (removepdt) {
                        console.log('Added to Cart')


                        //CART TOTAL 
                        const cart = await User.findOne({ _id: user._id }).populate('cart.product').exec()
                        let sum = 0
                        for (let i = 0; i < cart.cart.length; i++) {
                            sum = sum + cart.cart[i].prototalprice
                        }

                        const cartTotalPrice = await User.updateOne({ _id: user._id }, { $set: { cartTotalPrice: sum } })



                        res.json({ success: true })
                    }
                }

            }
        } else {
            res.redirect('/login')
        }


    } catch (err) {
        console.log(err)
        res.render('404')

    }
}

const QuantityChange = async (req, res) => {
    try {


        if (req.session.user) {

            const user = req.session.user

            console.log(user)
            const ProId = req.body.productid

            const Count = req.body.count

            const Price = req.body.price



            ProductData = await Product.findOne({ _id: ProId })

            //TO INCREMENT & DECREMENT QUANTITY



            const UpdatingQuantity = await User.updateOne({ _id: user._id, 'cart.product': ProId }, { $inc: { 'cart.$.quantity': Count } })

            console.log(UpdatingQuantity)
            //TO UPDATE PRICE USING CURRENT QUANTITY

            const UpdatedQuantity
                = await User.findOne({ _id: user._id, 'cart.product': ProId }, { _id: 0, 'cart.quantity.$': 1 })

            const TotalPrice = await Price * UpdatedQuantity.cart[0].quantity

            const UpdateTotalPrice = await User.updateOne({ _id: user._id, 'cart.product': ProId }, { $set: { 'cart.$.prototalprice': TotalPrice } })

            //CART TOTAL 
            const cart = await User.findOne({ _id: user._id }).populate('cart.product').exec()
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++) {
                sum = sum + cart.cart[i].prototalprice
            }

            const cartTotalPrice = await User.updateOne({ _id: user._id }, { $set: { cartTotalPrice: sum } })


            res.json({ success: true, TotalPrice, sum })
        } else {
            res.redirect('/login')
        }






    } catch (err) {
        console.log(err)
        res.render('404')
    }
}

const addWishlist = async (req, res) => {
    try {
        console.log('called')

        if (req.session.user) {


            const user = req.session.user
            console.log(user)
            const proId = req.body.productId
            console.log(proId)
            const data = await User.findOne({ _id: user._id, 'wishlist.products': proId })

            if (data) {
                res.json({ success: false })
            } else {
                const insert = await User.updateOne({ _id: user._id }, { $push: { wishlist: { products: proId } } })
                if (insert) {
                    console.log('done')
                    res.json({ success: true })

                }
            }
        } else {

            res.render('login', { message: 'please login to your account' })
        }
    } catch (error) {
        console.log(error.message);

    }
}
const deleteaddress = async (req, res) => {
    try {

        const user = req.session.user
        const addressId = req.body.addressId
        console.log(addressId)
        const deleted = await User.updateOne({ _id: user._id }, { $pull: { Address: { _id: addressId } } })
        console.log(deleted)

        if (deleted) {

            res.json({ success: true })

        }

    } catch (error) {

        console.log(error)
        res.render('404')

    }
}



const deletecart = async (req, res) => {
    try {
        const user = req.session.user
        const proid = req.body.productId
        console.log(proid)
        const found = await User.updateOne({ _id: user._id }, { $pull: { cart: { product: proid } } })


        //CART TOTAL 
        const cart = await User.findOne({ _id: user._id }).populate('cart.product').exec()
        let sum = 0
        for (let i = 0; i < cart.cart.length; i++) {
            sum = sum + cart.cart[i].prototalprice
        }

        const cartTotalPrice = await User.updateOne({ _id: user._id }, { $set: { cartTotalPrice: sum } })

        if (found) {

            res.json({ success: true })
        }





    } catch (err) {

        console.log(err)
        res.render('404')
    }
}



const deletewish = async (req, res) => {
    try {
        const user = req.session.user
        const proid = req.body.productId
        console.log(proid)
        const found = await User.updateOne({ _id: user._id }, { $pull: { wishlist: { products: proid } } })

        if (found) {
            res.json({ success: true })
        }





    } catch (err) {

        console.log(err)
        res.render('404')
    }
}


const loadCheckout = async (req, res) => {

    try {



        const categorydata = await Category.find({})


        const user = req.session.user

        const userData = await User.findOne({ _id: user._id })
        const cartData = await User.findOne({ _id: userData._id }).populate('cart.product')


        res.render('checkout', { user: user, userData: userData, categories: categorydata, cartData: cartData })

    } catch (err) {
        console.log(err)
        res.render('404')

    }

}

//generate hash password
const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;

    } catch (err) {
        console.log(err.message)
    }
}


//generateReferralCode
const generateReferralCode = () => {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
};
const generateCouponCode = () => {
    const length = 6;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return code;
};



const verifylogin = async (req, res) => {

    try {

        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({ email: email })

        if (!userData) {

            res.render('login', { message: "Looks like you haven't signed up for an account yet" })

        } else if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)

            if (password.length < 8) {


                res.render('login', { message: "Password must be conatin atleast 8 ", })
                return false;

            } else if (!/[A-Z]/.test(password)) {


                res.render('login', { message: "Password must contain at least one Uppercase", })

                return false;
            } else if (!/[a-z]/.test(password)) {


                res.render('login', { message: "Password must contain at least one Lowercase", })
                return false;
            } else if (!/\d/.test(password)) {

                res.render('login', { message: "Password must contain at least one  Digit", })
                return false;
            } else if (passwordMatch) {

                if (userData.is_active == true) {

                    if (userData.is_admin === 1) {

                        req.session.loggedIn = true
                        req.session.users = userData

                        res.redirect('/admin/dashboard')

                    } else {
                        req.session.loggedIn = true
                        req.session.user = userData
                        res.redirect('/');
                    }
                } else {

                    res.render('login', { message: "Your account has been banned due to a violation of our terms of service or community guidelines" })

                }




            } else {
                res.render('login', { message: "Invalid Credentials" })

            }

        } else {

            res.render('login', { message: "Invalid Credentials" })

        }



    } catch (err) {

        console.log(err)
    }


}

const loadlogin = (req, res) => {
    try {
        res.render('login')
    } catch (err) {
        console.log(err)
    }
}




const loadregister = (req, res) => {
    try {
        res.render('register')
    } catch (err) {
        console.log(err)
    }
}


const verifysignup = async (req, res, next) => {
    req.session.userdata = req.body

    console.log(req.session.userdata, "userdata from register")

    password = req.body.password;



    const exist = await User.findOne({ email: req.body.email, mobile: req.body.mobile })
    if (exist) {
        res.render('register', { messagered: "User already exists", })
        return false;

    } else if (password.length < 8) {


        res.render('register', { messagered: "Password must be conatin atleast 8 Characters", })
        return false;

    } else if (!/[A-Z]/.test(password)) {


        res.render('register', { messagered: "Password must contain at least one Uppercase", })

        return false;
    } else if (!/[a-z]/.test(password)) {


        res.render('register', { messagered: "Password must contain at least one Lowercase", })
        return false;
    } else if (!/\d/.test(password)) {

        res.render('register', { messagered: "Password must contain at least one  Digit", })
        return false;
    } else {

        mobile = req.body.mobile

        try {

            const otpResponse = await client.verify.v2
                .services('VAa0811298615bd4a84486fd5ac43cd5f0')
                .verifications.create({
                    to: `+91${mobile}`,
                    channel: 'sms'
                })

            res.render('verifyotp')

        } catch (err) {
            console.log(err)
            res.render('404')
        }
    }

}


const verifyOtp = async (req, res) => {
    const otp = req.body.otp;

    try {


        const details = req.session.userdata


        const verifiedResponse = await client.verify.v2
            .services('VAa0811298615bd4a84486fd5ac43cd5f0')
            .verificationChecks.create({
                to: `+91${details.mobile}`,
                code: otp
            })



        if (verifiedResponse.status === 'approved') {
            const referrsid = details.referalid



            const spassword = await securePassword(details.password);


            const referralCode = generateReferralCode();
            const userdata = new User({

                name: details.name,
                email: details.email,
                mobile: details.mobile,
                password: spassword,
                referralCode: referralCode,
                is_admin: 0,

            })

            const userData = await userdata.save();
            req.session.user = userData


            if (referrsid) {


                const referrer = await User.findOne({ referralCode: referrsid })




                if (referrer) {
                    // Associate the referred user with the referrer in the database
                    await User.findOneAndUpdate(
                        { _id: referrer._id },
                        { $push: { referredUsers: userData._id }, $inc: { referralCount: 1 } }
                    );


                    const referrerafterinc = await User.findOne({ referralCode: referrsid })


                    const count = referrerafterinc.referralCount



                    if (count == 1) {
                        const newcode = generateCouponCode()
                        const expDate = new Date()
                        expDate.setMonth(expDate.getMonth() + 1);
                        const maxDiscount = 1000
                        const MinPurchaseAmount = 3000
                        const percentage = 10






                        const coupon = new Coupon({
                            code: newcode,
                            expirationDate: expDate,
                            maxDiscount: maxDiscount,
                            MinPurchaseAmount: MinPurchaseAmount,
                            percentageOff: percentage,
                            referrer: referrer._id
                        });
                        const saving = await coupon.save();




                    } else if (count == 5) {

                        const newcode = generateCouponCode()
                        const expDate = new Date()
                        expDate.setMonth(expDate.getMonth() + 1);
                        const maxDiscount = 3000
                        const MinPurchaseAmount = 3000
                        const percentage = 30






                        const coupon = new Coupon({
                            code: newcode,
                            expirationDate: expDate,
                            maxDiscount: maxDiscount,
                            MinPurchaseAmount: MinPurchaseAmount,
                            percentageOff: percentage,
                            referrer: referrer._id
                        });
                        const saving = await coupon.save();

                    } else if (count == 10) {


                        const newcode = generateCouponCode()
                        const expDate = new Date()
                        expDate.setMonth(expDate.getMonth() + 1);
                        const maxDiscount = 5000
                        const MinPurchaseAmount = 4000
                        const percentage = 50






                        const coupon = new Coupon({
                            code: newcode,
                            expirationDate: expDate,
                            maxDiscount: maxDiscount,
                            MinPurchaseAmount: MinPurchaseAmount,
                            percentageOff: percentage,
                            referrer: referrer._id
                        });


                    } else if (count == 20) {

                        const newcode = generateCouponCode()
                        const expDate = new Date()
                        expDate.setMonth(expDate.getMonth() + 1);
                        const maxDiscount = 10000
                        const MinPurchaseAmount = 5000
                        const percentage = 70






                        const coupon = new Coupon({
                            code: newcode,
                            expirationDate: expDate,
                            maxDiscount: maxDiscount,
                            MinPurchaseAmount: MinPurchaseAmount,
                            percentageOff: percentage,
                            referrer: referrer._id
                        });


                        await User.findOneAndUpdate(
                            { _id: referrer._id },
                            { $push: { referredUsers: userData._id }, $set: { referralCount: 0 } }
                        );

                    }

                    if (req.session.user) {

                        res.redirect('/')

                    } else {
                        res.render('verifyotp', { messagered: "Please enter a valid OTP" })
                    }

                }



            } else {


                if (req.session.user) {

                    res.redirect('/')

                } else {
                    res.render('verifyotp', { messagered: "Please enter a valid OTP" })
                }


            }


        } else {

            res.render('verifyotp', { messagered: "Please enter a valid OTP" })

        }


    } catch (err) {
        console.log(err)
        res.render('404')
    }
}





//forget password
const requestotp = async (req, res) => {




    try {

        req.session.userdata = req.body
        const mobile = req.body.mobile


        const checkinDb = await User.findOne({ mobile: mobile })

        if (checkinDb) {


            const otpResponse = await client.verify.v2
                .services('VAa0811298615bd4a84486fd5ac43cd5f0')
                .verifications.create({
                    to: `+91${mobile}`,
                    channel: 'sms'
                })

            res.render('fpotpverify')





        } else {

            res.render('forgetpassword', { message: "You're not registered on our website." })
        }

    } catch (err) {

        console.log(err)
        res.render('404')
    }
}
// forget password
const verifyforgetpasswordotp = async (req, res) => {

    const otp = req.body.otp
    try {
        const userdata = req.session.userdata

        const verifiedResponse = await client.verify.v2
            .services('VAa0811298615bd4a84486fd5ac43cd5f0')
            .verificationChecks.create({
                to: `+91${userdata.mobile}`,
                code: otp
            })

        if (verifiedResponse.status === 'approved') {


            res.render('changepassword')

        }

    } catch (err) {
        console.log(err)

        res.render('404')
    }

}

//change password -forget password
const changepassword = async (req, res) => {
    try {

        const new_password = req.body.password
        const confirmpassword = req.body.confirmpassword

        const newhashpassword = await securePassword(new_password);


        if (new_password.length < 8) {


            res.render('changepassword', { message: "Password must be conatin atleast 8 Characters", })
            return false;

        } else if (!/[A-Z]/.test(new_password)) {


            res.render('changepassword', { message: "Password must contain at least one Uppercase", })

            return false;
        } else if (!/[a-z]/.test(new_password)) {


            res.render('changepassword', { message: "Password must contain at least one Lowercase", })
            return false;
        } else if (!/\d/.test(new_password)) {

            res.render('changepassword', { message: "Password must contain at least one  Digit", })
            return false;
        } else if (new_password != confirmpassword) {


            res.render('changepassword', { message: "Please double-check and confirm your password in the 'Confirm Password' field before submitting." })


        } else {


            const userdata = req.session.userdata


            const found = await User.updateOne({ mobile: userdata.mobile }, {
                $set: {
                    password: newhashpassword
                }
            })



            res.redirect('/login')

        }


    } catch (err) {
        console.log(err)
        res.render('404')
    }

}



//load homepage
const loadhomepage = async (req, res) => {

    try {
        const productdata = await Product.find({})
        const category = await Category.find({})
        let user = req.session.user
        if (user) {
            const userData = await User.findOne({ _id: user._id })


            countcart = userData.cart.length

            countcart = userData.cart.length



            if (productdata) {
                let user = req.session.user

                const banner = await Banner.find({})



                res.render('homepage', { product: productdata, categories: category, user: user, countcart: countcart, banner: banner })

            }

        } else {





            if (productdata) {
                let user = req.session.user


                const banner = await Banner.find({})

              

                res.render('homepage', { product: productdata, categories: category, user: user, banner: banner })

            }

        }
    } catch (err) {
        console.log(err)
        res.render('404')
    }
}



const loaduserprofile = async (req, res) => {
    try {
        let id = req.params.id

        const category = await Category.find({})
        const userData = await User.findOne({ _id: id })

        let user = req.session.user
        res.render('userprofile', { categories: category, user: user, userData: userData })

    } catch (err) {

        console.log(err)

        res.render('404')

    }
}


const loadedituserprofile = async (req, res) => {

    try {
        let id = req.params.id

        const category = await Category.find({})
        const userData = await User.findOne({ _id: id })

        let user = req.session.user

        res.render('edituserprofile', { categories: category, user: user, userData: userData })

        return;
    } catch (err) {
        console.log(err)
        res.render('404')
    }

}

const editUser = async (req, res) => {

    try {


        const userData = await User.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
            }
        })


        res.redirect('/')
        return;
    } catch (err) {
        console.log(err)
    }

}



const insertAddress = async (req, res) => {
    try {
        const user = req.session.user

        const address = await User.updateOne({ _id: req.session.user._id }, {
            $push: {
                Address: {

                    name: req.body.username,

                    address: req.body.address,

                    postcode: req.body.postcode,

                    state: req.body.state,

                    town: req.body.town,

                    contactnumber: req.body.contactnumber,

                    landmark: req.body.landmark

                }
            }
        })

        if (address) {
            res.redirect('/checkout')
        }



    } catch (err) {
        console.log(err)
        res.render('404')
    }
}





//add new user(register)
const insertUser = async (req, res) => {
    try {



        const referralCode = generateReferralCode();
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: spassword,
            referralCode: referralCode,
            is_admin: 0,
          });
          






        const userData = await user.save();

        if (userData) {

            res.redirect('/')
        } else {
            res.render('register', { message: "Oops! Registration  Failed" })
        }


    } catch (err) {
        console.log(err.message)
    }


}


const userLogout = async (req, res, next) => {

    try {

        req.session.user = null
        res.redirect('/')
        next()
    } catch (err) {
        console.log(err.message)
    }
}



const adminLogout = async (req, res, next) => {

    try {
        req.session.users = null
        req.session.destroy

        res.redirect('/login')
        next()
    } catch (err) {
        console.log(err.message)
    }
}



const loadallproductspage = async (req, res) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
        }
        const limit = 6;
        const skip = (page - 1) * limit;

        const productdata = await Product.find({})
            .skip(skip)
            .limit(limit)
            .exec();
        const category = await Category.find({});
        const countproducts = await Product.countDocuments({});
        const countdata = Math.ceil(countproducts / limit);

        const user = req.session.user;
        res.render("allproducts", {
            product: productdata,
            categories: category,
            user: user,
            countproducts: countdata,
            currentPage: page,
        });
    } catch (err) {
        console.log(err);
    }
};

//product view
const productDetails = async (req, res) => {

    try {
        let id = req.params.id

        const category = await Category.find({})
        const productdata = await Product.findOne({ _id: id })

        let user = req.session.user
        if (user) {
            const userData = await User.findOne({ _id: user._id })


            countcart = userData.cart.length
        }
        res.render('singleproduct', { product: productdata, categories: category, user: user, countcart: countcart })

    } catch (err) {
        console.log(err);
        res.render('404')
    }

}

const isProductInCart = (cart, id) => {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }
    return false
}

const calculateTotal = (cart, req) => {
    total = 0;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].price) {
            total = total + (cart[i].price * cart[i].quanitiy)
        }

        // else {
        //     total   = total + (cart[i].price*cart[i].quanitiy)
        // }
    }
    req.session.total = total;
    return total
}



const loadviewaddress = async (req, res) => {
    try {

        const categorydata = await Category.find({})


        const user = req.session.user

        const userData = await User.findOne({ _id: user._id })

        res.render('viewaddress', { userData: userData, user: user, categories: categorydata })

    } catch (err) {
        console.log(err);
        res.render('404')
    }
}

const loadeditaddress = async (req, res) => {


    try {

        const categorydata = await Category.find({})


        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        const addressid = req.params.id

        const address = await User.findOne({ _id: userdata._id, "Address._id": addressid }, { "Address.$": 1 })



        res.render('editaddress', { user: userdata, categories: categorydata, newaddress: address })

    } catch (err) {
        console.log(err);
        res.render('404')
    }
}


const editaddress = async (req, res) => {

    try {

        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        const addressid = req.params.id

        const UserAddress = await User.updateOne({ _id: userdata._id, "Address._id": addressid }, {
            $set: {
                'Address.$.name': req.body.username,
                'Address.$.address': req.body.address,
                'Address.$.postcode': req.body.postcode,
                'Address.$.state': req.body.state,
                'Address.$.town': req.body.town,
                'Address.$.contactnumber': req.body.contactnumber,
                'Address.$.landmark': req.body.landmark,



            }
        })


        res.redirect('/address')

    } catch (err) {

        console.log(err)
        res.render('404')
    }

}


const loadaddaddress = async (req, res) => {
    try {
        const categorydata = await Category.find({})
        const user = req.session.user
        const userdata = await User.findOne({ _id: user._id })
        res.render('add_address', { user: userdata, categories: categorydata })
    } catch (err) {
        console.log(err)
        res.render('404')
    }
}


const addaddress = async (req, res) => {
    try {
        const user = req.session.user

        const address = await User.updateOne({ _id: req.session.user._id }, {
            $push: {
                Address: {

                    name: req.body.username,

                    address: req.body.address,

                    postcode: req.body.postcode,

                    state: req.body.state,

                    town: req.body.town,

                    contactnumber: req.body.contactnumber,

                    landmark: req.body.landmark

                }
            }
        })

        if (address) {
            res.redirect('/address')
        }



    } catch (err) {
        console.log(err)
        res.render('404')
    }
}

const loadforgetpassword = async (req, res) => {

    try {

        res.render('forgetpassword')

    } catch (err) {

        console.log(err)
        res.render('404')
    }

}



const statusCancel = async (req, res) => {
    try {

        const proId = req.body.productId

        const Confirm = await Order.findOne({ 'product._id': proId },
            { 'product.status': 1, _id: 0 });




        const updated = await Order.updateOne({ 'product._id': proId }, { $set: { 'product.$.status': 'Order Cancelled' } })


        if (updated) {

            res.json({ success: true })
        }





    } catch (err) {


        console.log(err)


    }
}



const searchSortFilter = async (req, res) => {

    try {
        const query = req.query.q;
        const sortField = req.query.sortField;
        const filterField = req.query.filterField;


        let results = await Product.find({
            product: { $regex: new RegExp(query, 'i') },
            Category: { $regex: new RegExp(filterField, 'i') }
        });

        // apply sort
        if (sortField) {
            if (sortField === 'asc') {
                results = results.sort((a, b) => a.price - b.price);
            } else if (sortField === 'desc') {
                results = results.sort((a, b) => b.price - a.price);
            }
        }


        if (results) {
            res.json(results);
        }
    } catch (err) {
        console.log(err);
        res.render('404');
    }
};




const loadorders = async (req, res) => {
    try {
        let page = 1;



        const user = req.session.user;
        const userdata = await User.findOne({ _id: user._id });

        const orders = await Order.find({ userId: user._id })
            .populate('product.productId')


            .sort({ date: -1 })
            .exec();






        res.render('orders', {
            user: userdata,
            orderData: orders,


        });
    } catch (err) {
        console.log(err);
    }
};



const statusreturn = async (req, res) => {
    try {
        const proId = req.body.productId

        const Confirm = await Order.findOne({ 'product._id': proId },
            { 'product.status': 1, _id: 0 });

        console.log(Confirm);



        const updated = await Order.updateOne({ 'product._id': proId }, { $set: { 'product.$.status': 'Return' } })


        if (updated) {

            res.json({ success: true })
        }





    } catch (err) {


        console.log(err)


    }
}


module.exports = {
    loadlogin,
    loadregister,
    loadhomepage,
    insertUser,
    verifylogin,
    userLogout,
    adminLogout,
    verifysignup,
    loadallproductspage,
    verifyOtp,
    productDetails,
    loaduserprofile,
    loadedituserprofile,
    editUser,
    loadCart,
    addWishlist,
    loadWishlist,
    addToCart,
    deletecart,
    deletewish,
    QuantityChange,
    loadCheckout,
    loadcheckoutaddaddress,
    insertAddress,
    placeorder,
    loadorderplaced,
    loadviewaddress,
    loadeditaddress,
    editaddress,
    deleteaddress,
    loadaddaddress,
    addaddress,
    loadforgetpassword,
    requestotp,
    verifyforgetpasswordotp,
    changepassword,
    searchSortFilter,
    loadorders,
    statusCancel,
    statusreturn,
    changePassword,
    changePasswordpost,
    verifyPayment,
    applyCoupon,
    loadreferals_coupons

}

