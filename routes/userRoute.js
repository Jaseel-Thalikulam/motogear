const express = require("express")
const nocache = require('nocache');
const user_route = express()
const  admin_route = express ();
const session = require("express-session")



// view engine setup
user_route.set('view engine', 'ejs')

user_route.set('views','./views/users')

const auth = require("../middleware/auth")

user_route.use(nocache());

const bodyParser = require('body-parser')

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }))

const userController = require("../controllers/userController");



user_route.get('/login',auth.isadminLogout,auth.isLogout, userController.loadlogin)
// admin_route.get('/login',auth.isadminLogout, userController.loadlogin)
user_route.post('/login', userController.verifylogin)

user_route.get('/register',userController.loadregister)
user_route.post('/register', userController.verifysignup);
user_route.post('/verifyotp', userController.verifyOtp);

user_route.post('/verifyotpforgetpassword', userController.verifyforgetpasswordotp);
// userController.insertUser



user_route.get('/',userController.loadhomepage)
user_route.get('/logout', userController.userLogout )
user_route.get('/admin/logout', userController.adminLogout)


//product
user_route.get('/allproducts',auth.isLogin, userController.loadallproductspage)
user_route.get('/productdetails/:id', userController.productDetails)

user_route.get('/loadorders',auth.isLogin, userController.loadorders)

// user_route.post('/addtocart',userController.addToCart)
user_route.get('/profile/:id',auth.isLogin,userController.loaduserprofile)
user_route.get('/editprofile/:id',auth.isLogin,userController.loadedituserprofile)
user_route.post('/editprofile', auth.isLogin, userController.editUser)

user_route.post('/addToWishlist',userController.addWishlist)
user_route.get('/wishlist', auth.isLogin, userController.loadWishlist)
//cart

user_route.get('/cart', auth.isLogin, userController.loadCart)

user_route.get('/checkout', auth.isLogin, userController.loadCheckout)

user_route.post('/addToCart',userController.addToCart)
user_route.post('/deletecart', userController.deletecart)

user_route.post('/deletewish',userController.deletewish)
user_route.post('/changeQuantity',userController.QuantityChange)

user_route.get('/checkout/addaddress',auth.isLogin,userController.loadcheckoutaddaddress)
user_route.post('/checkout/addaddress',auth.isLogin,userController.insertAddress)



user_route.post('/place-order',auth.isLogin,userController.placeorder)
user_route.get('/orderplaced', auth.isLogin, userController.loadorderplaced)
user_route.get('/address', auth.isLogin, userController.loadviewaddress)
user_route.get('/editaddress/:id', auth.isLogin, userController.loadeditaddress)
user_route.post('/editaddress/:id', auth.isLogin, userController.editaddress)
user_route.post('/deleteaddress',userController.deleteaddress)
user_route.get('/addaddress',auth.isLogin,userController.loadaddaddress)
user_route.post('/addaddress',auth.isLogin,userController.addaddress)

user_route.get('/forgetpassword',userController.loadforgetpassword)
user_route.post('/forgetpassword', userController.requestotp)
user_route.post('/verifyotpforgetpassword', userController.verifyforgetpasswordotp);
user_route.post('/changepassword', userController.changepassword);



user_route.post('/verify-payment',auth.isLogin,userController.verifyPayment)

user_route.get('/searchSortFilter', userController.searchSortFilter);
user_route.post('/status-cancel',userController.statusCancel)
user_route.post('/status-return',userController.statusreturn)
user_route.get('/changepasssword',auth.isLogin,userController.changePassword)
user_route.post('/changepasssword',auth.isLogin, userController.changePasswordpost)

user_route.post('/applyCoupon',auth.isLogin,userController.applyCoupon),
user_route.get('/referals_coupons',auth.isLogin,userController.loadreferals_coupons),

module.exports = user_route;