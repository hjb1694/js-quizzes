module.exports = (req,res,next) => {

    if(!req.session.hasPaid){
        next();
    } else {
        res.redirect('/user/test');
    }

}