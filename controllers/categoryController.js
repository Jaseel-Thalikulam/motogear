
const  Category = require('../models/categoryModel')

const loadaddcategory = async (req, res) => {
    try {

        let user = req.session.users
        res.render('add-category', {user:user})
        
    } catch {
        res.render('404')
    }
}


//list category
const ListCategory = async (req, res) => {
    let id = req.query.id;
    const TakeListedCategory = await Category.findOne(
      { _id: id },
      { categoryStatus: 1, _id: 0 }
    );
    if (TakeListedCategory.categoryStatus == false) {
      await Category.updateOne({ _id: id }, { $set: { categoryStatus: true } });
      res.redirect("/admin/category");
    } else {
      await Category.updateOne({ _id: id }, { $set: { categoryStatus: false } });
      res.redirect("/admin/category");
    }
};
  
//delete category
const deleteCategory = async (req, res) => { 

    try {
        const id = req.query.id;
        await Category.deleteOne({ _id: id })
        res.redirect('/admin/category')

    } catch (err) {
        console.log(err);
}

}

//update category
const updateCategory = async (req, res) => { 

    try {

        const categoryData = await Category.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                category: req.body.category,
                description: req.body.description
            }
        })

        res.redirect('/admin/category')   
    } catch (err) { 
        console.log(err)
    }

}
//edit category load
const editCategoryLoad = async (req, res) => {
    try {
        let user = req.session.users
        const id = req.query.id;
        const categoryData = await Category.findById({ _id: id });
        if (categoryData) {
            res.render('edit-category', { category: categoryData,user:user })

        } else {
            res.redirect('/admin/category')

        }

    } catch (err) { 
        res.render('404')
    }
}

const verifyCategory = async (req, res,next) => { 

const exist = await Category.findOne({ category:req.body.category})
    if (exist) {
        let user = req.session.users
        res.render('add-category',{messagered :"Category already exists", user:user})
        return false;
    }

    next()


}

const insertCategory = async(req,res)=>{
    try{

        const category = new Category({

           category:req.body.category,
            description: req.body.description,
           
        })

    const categoryData = await category.save();
    
    if(categoryData){

        res.redirect('/admin/category')
    }else{
        res.render('add-category',{messagered:"Oops! "})
    }

    }catch(err){
console.log(err.message)
    }
}

module.exports = {
    loadaddcategory,
    insertCategory,
    deleteCategory,
    updateCategory,
    editCategoryLoad,
    ListCategory,
    verifyCategory,
  

}