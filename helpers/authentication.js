module.exports = {
    userAuthenticated: (req,res,next)=>{
        if(req.isAuthenticated()){
            //go to next request whatever it is
            return next();
        } else {
            res.redirect('/login');
        };
    }
}