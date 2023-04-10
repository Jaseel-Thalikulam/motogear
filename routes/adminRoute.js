const express = require("express");
const  admin_route = express ();
const bodyParser = require("body-parser");


const session = require("express-session");


const multer = require("multer");
const path = require("path")

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,path.join(__dirname,'../public/assets/img'))
    },
    filename: function(req,file,cb) {
        const name = Date.now()+ '-' + file.originalname;
   
        cb(null,name)
    }
})

const upload = multer({storage: storage})


admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));


//view engine
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');


const adminauth = require('../middleware/adminauth')
const adminController = require("../controllers/adminController")
const categoryController =require("../controllers/categoryController")
const productsController = require("../controllers/productController")

const userController = require("../controllers/userController")
const auth = require("../middleware/auth")

//dashboard
admin_route.get("/dashboard",adminauth.isLogin ,adminController.loadDashboard)
admin_route.get("/profile", adminauth.isLogin, adminController.loadadminprofile)


admin_route.get("/banner", adminauth.isLogin, adminController.loadbanner)
// categories route
admin_route.get("/category", adminauth.isLogin, adminController.loadcategory)

admin_route.get("/category/addcategory", adminauth.isLogin, categoryController.loadaddcategory)
admin_route.get("/banner/add-banner", adminauth.isLogin, adminController.loadaddbanner)

admin_route.post("/banner/add-banner",upload.array('image',1),adminController.insertBanner)
admin_route.post("/update-banner-image",upload.array('image',1),adminController.updatebannerImage)



admin_route.post("/category/addcategory",adminauth.isLogin,categoryController.verifyCategory, categoryController.insertCategory)

admin_route.get('/delete-category', categoryController.deleteCategory)
admin_route.get('/delete-banner', adminController.deleteBanner)


admin_route.get('/unlist-category', categoryController.ListCategory)



admin_route.post('/status-confirm', adminController.statusConfirm)
admin_route.post('/status-cancel', adminController.statusCancel)
admin_route.post('/status-packing', adminController.statusPacking)
admin_route.post('/status-shipped', adminController.statusShipped)
admin_route.post('/status-outfordelivery', adminController.outfordelivery)
admin_route.post('/status-delivered', adminController.statusdelivered)
admin_route.post('/status-return', adminController.statusreturn)

admin_route.get('/edit-category', categoryController.editCategoryLoad)
admin_route.get('/edit-banner', adminController.editBannerLoad)

admin_route.post('/edit-banner', adminController.updatebanner)
admin_route.post('/edit-category', categoryController.updateCategory)

//orders route
admin_route.get('/orders', adminauth.isLogin,adminController.loadorders)
//products route
admin_route.get('/products',  adminauth.isLogin, adminController.loadproductspage)

admin_route.get('/products/addproduct', adminauth.isLogin,productsController.loadaddproduct)

admin_route.post('/products/addproduct', upload.array('image'), productsController.insertProduct)

admin_route.get('/products/editproduct',adminauth.isLogin, productsController.loadeditproduct)

admin_route.post('/products/editproduct', productsController.productUpdate)

admin_route.post ('/updateimage',upload.array('image'),productsController.updateimage)


admin_route.get('/unlist-product', productsController.ListProduct)

//userlist route
admin_route.get("/userslist", adminauth.isLogin, adminController.loaduserslist)

admin_route.get('/userslist',adminauth.isLogin, adminController.loaduserslist)

admin_route.get('/add-user', adminauth.isLogin,adminController.loadadduser)

admin_route.post('/add-user', adminController.insertUser)

admin_route.get('/edit-user',adminauth.isLogin, adminController.loadEditUser)

admin_route.post('/edit-user',adminauth.isLogin, adminController.editUser)
admin_route.post('/profile', adminController.editAdmin)

admin_route.get('/block-user',adminController.blockUser)
admin_route.get('/delete-user',adminController.deleteUser)

admin_route.get('/sales',adminauth.isLogin,adminController.loadSales)
admin_route.post('/sales',adminauth.isLogin,adminController.salesReport)


//admin coupon routes......................................................
admin_route.get('/coupon',adminauth.isLogin,adminController.loadCoupon)
admin_route.get('/coupon/addcoupon',adminauth.isLogin,adminController.loadAddCoupon)
admin_route.post('/coupon/addcoupon',adminauth.isLogin,adminController.AddCoupon)
admin_route.get('/coupon/delete/:id',adminauth.isLogin,adminController.deleteCoupon)
admin_route.get('/coupon/edit/:id',adminauth.isLogin,adminController.LoadEditCoupon)
admin_route.post('/coupon/edit/:id',adminauth.isLogin,adminController.updateCoupon)
admin_route.post('/updatedate', adminauth.isLogin, adminController.updateCouponexp)
admin_route.post('/uploadcrp', productsController.uploadcrp);

module.exports = admin_route;



