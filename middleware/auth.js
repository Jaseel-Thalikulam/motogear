
const isLogin = async(req, res, next) =>{
    try {
        if (req.session.user) {
           next()
        }
        else {
            return res.redirect('/login');
        }
        // next();
    } catch (error) {
        console.error(error.message);
    }
};


const isadminLogout = async (req, res, next) => {
    try {
        if (req.session.users){
            console.log("session-exist")
            return res.redirect('/admin/dashboard')
       
        }
        next()
    } catch {
        console.log(err.message)
    }
}



const isadminLogin = async (req,res,next) => {
    try {
        
        if (req.session.users === null) {
            console.log("session is null")

            return res.redirect("/login")
        }

          next()
    } catch (err) {
        console.log(err.message)
    }
}




// const isadminLogin = async (req, res, next) => {
//     try {
        
//         if (req.session.users) {
//             console.log("session is null")

//             return res.redirect("/admin/dashboard")
//             next()
//         } else {
//             return res.redirect("/login")
//             next()
//         }
//     } catch(err) {
//         console.log(err)
//     }
// }


const isLogout = async(req, res, next) =>{
    try{
        if(req.session.user){

            
            return res.redirect('/')
            

        }
    next()
    }catch(err){
        console.log(err.message);
    }
    
   
    }

module.exports = {
        
        isLogin,
        isLogout,
        isadminLogout,

        isadminLogin,
    }
    
    