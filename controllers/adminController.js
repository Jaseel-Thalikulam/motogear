const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Category = require("../models/categoryModel")
const  Product = require('../models/productModel')
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');


const generateReferralCode = () => {
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
};



const loadCoupon = async (req, res) => {
    try {
      const coupon = await Coupon.find();
  
      let user = req.session.users

      res.render("coupon", { coupon,user: user });
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  
  //admin add coupon apage load
  const loadAddCoupon = (req, res) => {
    try {
      let user = req.session.users
      res.render("addcoupon", { user: user });
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  
  //admin adding new coupon
  const AddCoupon = async (req, res) => {
    try {
      const coupondata = await Coupon.find();
      code = req.body.code;
      newcode = code.toUpperCase();
      let user = req.session.users
      const couponData = await Coupon.findOne({ code: newcode });
  
      if (couponData) {
        res.render("addcoupon", { message: "coupon alredy exists", user: user });
      } else {
        const coupon = new Coupon({
          code: newcode,
          expirationDate: req.body.expdate,
          maxDiscount: req.body.maxdiscount,
          MinPurchaseAmount: req.body.minpurchaseamount,
          percentageOff: req.body.percentageoff,
        });
        const saving = await coupon.save();

        res.redirect("/admin/coupon");
        // res.redirect("/admin/coupon", {user:user,coupon:coupondata})
      }
    } catch (error) {
      console.log(error.message);
      res.render("404");
    }
  };
  
  //admin deleting coupon
  const deleteCoupon = async (req, res) => {
    try {
      couponId = req.params.id;
      const updated = await Coupon.deleteOne({ _id: couponId });
      res.redirect("/admin/coupon");
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  
  //admin edit coupon page
  const LoadEditCoupon = async (req, res) => {
    try {
      id = req.params.id;
      let user = req.session.users
      const coupon = await Coupon.findOne({ _id: id });
      res.render("editcoupon", { coupon,user });
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  
  //admin updating coupon
  const updateCoupon = async (req, res) => {
    try {
      const id = req.body.id;
  
      code = req.body.code;
  
      newcode = code.toUpperCase();
     
        const updated = await Coupon.updateOne(
          { _id: id },
          {
            $set: {
              code: newcode,
              expirationDate: req.body.expdate,
              maxDiscount: req.body.maxdiscount,
              MinPurchaseAmount: req.body.minpurchaseamount,
              percentageOff: req.body.percentageoff,
            },
          }
        );
        if (updated) {
          res.redirect("/admin/coupon");
        }
      
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };
  const updateCouponexp = async (req, res) => {
    try {
      const id = req.body.id;
  
      console.log(id)

      
        const updated = await Coupon.updateOne(
          { _id: id },
          {
            $set: {
              
              expirationDate: req.body.expdate,
             
            },
          }
        );
        if (updated) {
          res.redirect("/admin/coupon");
        }
      
    } catch (error) {
      console.log(error.message);
      res.render("500");
    }
  };




const loadDashboard = async(req,res)=> {
    try {
        let user = req.session.users

        const deliveredProductsInfo = await Order.aggregate([
            { $unwind: "$product" }, // flatten the product array
            { $match: { "product.status": "Delivered"} }, // match only elements with status "Delivered"
            { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: "$product.singleTotal" } } } // group and count the matched elements, and sum the singleTotal values of the products
        ]).then(result => result.length > 0 ? result[0] : { count: 0, totalAmount: 0 }) // return an object with count and totalAmount properties, or default to 0 for both if no elements were matched

        // console.log(deliveredProductsInfo)


        const amount = deliveredProductsInfo.totalAmount.toLocaleString()


        const salesChart = await Order.aggregate([
            {
              $match: {
                "product.status": {
                  $eq: "Delivered"
                }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: "$total" },
                
              }
            },
            {
              $sort: { _id: 1 }
            },
            {
              $limit: 7
            }
          ]);
          
          const date = salesChart.map((item) => {
            return item._id;
          });
          
          const revenue = salesChart.map((item) => {
            return item.revenue;
          });
          
        console.log(salesChart)
        console.log(date)
        console.log(revenue)

        res.render('dashboard', { user: user, sales: deliveredProductsInfo.count,revenue: amount,revenueChart:revenue,dateChart:date})
        return;
    


    } catch (err) { 
        res.render('404')
    }

}


const statusCancel = async (req, res) => { 
    try {
    



        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
        
        console.log(Confirm);
        
           

        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Order Cancelled' } })
      

        if (updated) {
            console.log("Order Cancelled")
            res.json({success: true})
        }

        console.log(updated)




    } catch (err) { 


        console.log(err)


    }
}

const statusPacking = async (req, res) => { 
    try {
    
        

        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
        
        console.log(Confirm);
        
           

        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Packing' } })
      

        if (updated) {
            console.log("Order Packing successful")
            res.json({success: true})
        }

        console.log(updated)





    } catch (err) { 


        console.log(err)


    }
}


const statusShipped = async (req, res) => { 
    try {
    

        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
        
        console.log(Confirm);
        
           

        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Shipped' } })
      

        if (updated) {
            console.log("Order Shipped Success")
            res.json({success: true})
        }

        console.log(updated)

      

    } catch (err) { 


        console.log(err)


    }
}
const outfordelivery = async (req, res) => { 
    try {
    
        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
        
        console.log(Confirm);
        
        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Out for delivery' } })
      

        if (updated) {
            console.log("Order OFD Success")
            res.json({success: true})
        }

        console.log(updated)

    
    } catch (err) { 


        console.log(err)


    }
}

const statusreturn = async (req, res) => { 
    try {
    


        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
        
        console.log(Confirm);
        
        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Return' } })
      

        if (updated) {
            console.log("Order Return Success")
            res.json({success: true})
        }

        console.log(updated)

    


        


    } catch (err) { 


        console.log(err)


    }
}


const statusdelivered = async (req, res) => { 
    try {
    
        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
          
        console.log(Confirm);
        
        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Delivered'} })
      

        if (updated) {
            console.log("Order Shipped Success")
            res.json({success: true})
        }

        console.log(updated)


    
    } catch (err) { 


        console.log(err)


    }
}


const statusConfirm = async (req, res) => { 
    try {
     

        const proId = req.body.productId
        console.log("helooo")
        const Confirm = await Order.findOne({ 'product._id':proId },
            { 'product.status': 1, _id: 0 });
        
        console.log(Confirm);
        
           

        const updated = await Order.updateOne({ 'product._id':proId }, { $set: { 'product.$.status': 'Order Confirmed' } })
      

        if (updated) {
            console.log("order Confirmed")
            res.json({success: true})
        }

        console.log(updated)

    } catch (err) { 


        console.log(err)


    }
}


const loadorders = async (req, res) => {

    try {

        let user = req.session.users
        const order = await Order.find().populate('product.productId').populate('userId');
        console.log(order)
     

        res.render('orders',{user: user,orderData: order})


    } catch (err) {
     
        console.log(err)
    }

 }

const loadproductspage = async (req, res) => { 
    try { let user = req.session.users
        const product = await Product.find()
        res.render('products', { product: product,user: user }) 
        return;
    } catch (err) { 
        res.render('404')
    }   

}
//block & unblock
const blockUser= async (req, res) => {
    let id = req.query.id;
    const activeusers = await User.findOne(
      { _id: id },
      { is_active: 1, _id: 0 }
    );
    if (activeusers.is_active == false) {
      await User.updateOne({ _id: id }, { $set: { is_active: true } });
        res.redirect("/admin/userslist");
        return;
    } else {
      await User.updateOne({ _id: id }, { $set: { is_active: false } });
        res.redirect("/admin/userslist");
        return;
    }
  };





const loadcategory = async (req, res) => { 

    try {
        let user = req.session.users
        userData =await  User.findOne({_id:user._id})
        console.log(userData)
        const category = await Category.find()
        res.render('category', { categories: category,user: userData })
        return;
    } catch(err){
        res.render('404')
    }
}




const loaduserslist = async(req,res) => {
    try {
        let user = req.session.users
        const userlist = await User.find()
        res.render('users-list',{userlist: userlist,user: user})
        return;
    } catch(err) {
        res.render('404')
    }
}

const loadadduser = async (req, res) => { 
    try {
        let user = req.session.users
        
        res.render('adduser',{user: user})
        return;

    } catch {
        res.render('404')
    }
}



const deleteUser = async (req, res) => { 

    try {
        const id = req.query.id;
        await User.deleteOne({ _id: id })
        res.redirect('/admin/userslist')
        return;

    } catch (err) {
        console.log(err);
}

}


const securePassword = async(password)=>{
    try{

       const passwordHash = await bcrypt.hash(password,10);

       return passwordHash;

    }catch(err){
        console.log(err.message)
    }
}


const insertUser = async(req,res)=>{
    try{

        
      const referralCode = generateReferralCode();
        const spassword = await securePassword(req.body.password);
        const user = new User({

            name:req.body.name,
            email:req.body.email,
             mobile:req.body.mobile,
          password: spassword,
          referralCode:referralCode,
            is_admin:0,
        })

    const userData = await user.save();
    
    if(userData){

        res.redirect('/admin/userslist')
        return;
    }

    }catch(err){
console.log(err.message)
    }
}

const loadEditUser = async (req, res)=> { 
    try {
        let user = req.session.users
        const id = req.query.id;

        console.log(id)
        const UserData = await User.findById({ _id: id });
        if (UserData) {
            res.render('edit-user', { UserData: UserData,user:user },)
            return;

        } else {
            res.redirect('/admin/userslist')
            return;

        }


        

    } catch (err) { 
        res.render('404')
    }

}


const editUser = async (req, res) => { 

    try {
        

        const userData = await User.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                name:req.body.name,
                email:req.body.email,
                 mobile:req.body.mobile,
            }
        })

        res.redirect('/admin/userslist')  
        return;
    } catch (err) { 
        console.log(err)
    }

}


const loadadminprofile = async (req, res) => { 
    try {
        let user = req.session.users 
        userData = await User.findOne({_id:user._id})
        // console.log(user)
        res.render('admin-profile',{user: userData})
        return;
    } catch (err) { 
        res.render('404')
    }
}


const editAdmin = async (req, res) => { 

    try {

        // const id = req.query.id;
     
        let user = req.session.users
        const userData = await User.updateOne({ _id:user._id }, {

                     $set: {
                name:req.body.fullName,
                email:req.body.email,
                 mobile:req.body.phone,
            }
        })

        console.log(userData)

        res.redirect('/admin/profile')  
        return;
    } catch (err) { 
       res.render('404')
    }

}

const loadSales = async (req, res) => { 

  try {
    let user = req.session.users

    const Deliveredorder = await Order.find({
      'product.status': 'Delivered'
    }).populate('product.productId');

    

   
    res.render('sales',{user:user,Deliveredorder:Deliveredorder})


  } catch (err) { 
    console.log(err)
    res.render('404')
  }

}



const salesReport=async(req,res)=>{
  try {
    console.log("Salesreports page loaded")
    
    // create a new date object with the existing date
const existingDate = new Date(req.body.to);

// add one day to the existing date
const newDate = new Date(existingDate);
newDate.setDate(existingDate.getDate() + 1);


if(req.body.from==""||req.body.to==""){
  res.render('sales',{message:'all fields are required'})
 }else{
  
const ss = await Order.find({
  'product.status': 'Delivered',
  date: { $gte: req.body.from, $lte: req.body.to },
}).populate('product.productId');

  

res.render("salesreport", {
  ss
  });
 }

  } catch (error) {
    console.log(error.message)
      res.render('500')
  }
 }



module.exports = {
    loadDashboard,
    loadadminprofile,
    loadcategory,
    loaduserslist,
    loadproductspage,
    blockUser,
    deleteUser,
    loadadduser,
    insertUser,
    loadEditUser,
    editUser,
    editAdmin,
    loadorders,
    statusConfirm,
    statusCancel,
    statusPacking,
    statusShipped,
    outfordelivery,
    statusdelivered,
    statusreturn,
    loadCoupon,
  loadAddCoupon,
  AddCoupon,
  deleteCoupon,
  LoadEditCoupon,
  updateCouponexp,
  updateCoupon,
  loadSales,
  salesReport

}