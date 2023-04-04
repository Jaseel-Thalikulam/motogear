const isLogin = async (req,res,next)=>{
    try{

        if(req.session.users){
            
            next();
        }else{


           return res.redirect('/login');

        }

       

    }catch(err){
        console.log(err.message)
    }
}

const isLogout = async(req,res,next)=>{
    try{


        if(req.session.users){
        //    return res.redirect('/admin/dashboard')
        }
        next();

    }catch(err){
        console.log(err.message)
    }
}



module.exports ={
    isLogin,
    isLogout   
}