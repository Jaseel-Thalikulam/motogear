
const  Product = require('../models/productModel')
const  Category = require('../models/categoryModel')
const fs = require('fs');


const uploadcrp = async (req, res) => {
    
    const folderPath = 'images/';
    const image_parts = req.body.image.split(';base64,');
    const image_type_aux = image_parts[0].split('image/');
    const image_type = image_type_aux[1];
    const image_base64 = Buffer.from(image_parts[1], 'base64');
    const file = folderPath + Date.now() + '.png';
  

    

    fs.writeFile(file, image_base64, 'binary', (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload image.' });
      } else {
        res.json({ message: 'Image uploaded successfully.' });
      }
    });
}


const ListProduct = async (req, res) => {

    console.log("HELOOOOOO LIST PRODUCT")
    
    let id = req.query.id;
console.log(id)
    const TakeListedProduct = await Product.findOne(
      { _id: id },
        { show: 1, _id: 0 }
      
    );
    console.log(TakeListedProduct)
    if (TakeListedProduct.show == false) {
      await Product.updateOne({ _id: id }, { $set: { show: true } });
      res.redirect("/admin/products");
    } else {
      await Product.updateOne({ _id: id }, { $set: { show: false } });
      res.redirect("/admin/products");
    }


 }




const loadaddproduct = async (req, res) => {
    try {
        const category = await Category.find()
        let user = req.session.users
        res.render('add-product',{category:category,user:user})
        
    } catch (err) { 
        console.log(err)
    }
}



const insertProduct = async(req,res)=>{
    try{
        const imageArray = [];
        for (let i = 0; i < req.files.length; i++) {
            imageArray.push(req.files[i].filename);
        }

        const offer = req.body.offer
        const Price = req.body.price

      




            const offerPrice = Math.round(Price * offer / 100)
            const newprice = Price - offerPrice
            console.log(offerPrice)
            
            const product = new Product({

        
                product: req.body.productname,
                Category: req.body.category,
                Description: req.body.description,
                Stock: req.body.stock,
                price: req.body.price,
                offer: req.body.offer,
                offerprice:newprice,
                image:imageArray
               
    
               
            })
       
           var productData = await product.save();
            
      

     
    
    if(productData){
       
        res.redirect('/admin/products')
    } else {
        const category = await Category.find()
        res.redirect('/admin/products/addproduct',{category:category,message:"Oops! "},)
    }

    }catch(err){
console.log(err.message)
    }
}



const loadeditproduct = async (req, res) => {
    try {
        const id = req.query.id;
        let user = req.session.users

        const category = await Category.find()
        const product = await Product.findById({ _id: id })
        if (product) {
       
            res.render('edit-product', { category: category,product: product,user:user })
       
        } else {
            res.redirect('/admin/products')
        }
       
    } catch (err) { 
        console.log(err)
    }
}


const updatebannerImage = async (req, res) => {
    try {
    

        const productData = await Product.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {

                image: imageArray
            
            }

        })

    } catch (err) {
        console.log(err)
        res.render('404')

    }

}

const updateimage = async (req, res) => { 
    try {
        
        const imageArray = [];
        for (let i = 0; i < req.files.length; i++) {
            imageArray.push(req.files[i].filename);
        }

        const productData = await Product.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {

            image:imageArray
            
            }

        })

        res.redirect('/admin/products')




    } catch (err) {
        console.log(err)
        res.render('404')

    }
}

const productUpdate = async (req, res) => {

    try {


        const offer = req.body.offer
        const Price = req.body.price

      




            const offerPrice = Math.round(Price * offer / 100)
            const newprice = Price - offerPrice
            console.log(offerPrice)
          

            
      


      

            
            const productData = await Product.findByIdAndUpdate({ _id: req.body.id }, {
                $set: {
                   
                product: req.body.productname,
                Category: req.body.category,
                Description: req.body.description,
                Stock: req.body.stock,
                    price: req.body.price,
                    offer: req.body.offer,
                    offerprice:newprice,
                     
                }
    
            })

      



   
      

        res.redirect('/admin/products')
    } catch (err) {


    }

}



module.exports = {
    loadaddproduct,
    insertProduct,
    loadeditproduct,
    productUpdate,
    updateimage,
    ListProduct,
    uploadcrp
 

}