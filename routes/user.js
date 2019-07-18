const express = require('express');
const {body, check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')('sk_test_YPDTG8HvehUrsJfta60sywzZ00ILag6LGH');

const router = new express.Router();


const loggedInFalse = require('../middleware/loggedInFalse');
const loggedInTrue = require('../middleware/loggedInTrue');
const hasPaidFalse = require('../middleware/hasPaidFalse');

const db = require('../util/db');

router.get('/register', loggedInFalse, (req,res,next) => {

    res.render('register',{
        title : 'register'
    });


});


router.post('/register', loggedInFalse, [
    check('email').isEmail()
    // body('pass').custom(val => {
    //     if(val.length < 8){
    //         throw new Error('Password must be at least 8 characters.');
    //     }
    // })
] , async (req,res,next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.json({errors : errors.array()});
    }

    const form = {
        email : req.body.email.toLowerCase(), 
        password : req.body.pass,
        confirmPass : req.body.confirmpass
    }

    let qry = `
    SELECT COUNT(*) AS count 
    FROM users
    WHERE email = ?
    `;

    let [rows, fields] = await db.execute(qry,[form.email]);

    if(rows[0].count){

        return res.json({errors : 'This email already exists. Try logging in.'});

    } else {

        const hashedPassword = bcrypt.hashSync(req.body.pass, 8);

        let qry = `
        INSERT INTO users(email,password,has_paid)
        VALUES(?,?,?)
        `;


        const result = await db.execute(qry,[req.body.email,hashedPassword,0]);

        if(result[0].affectedRows < 1){

            return res.json({errors : 'Sorry, there was an issue processing your request.'});

        }

        req.session.isLoggedIn = true;
        req.session.userId = result[0].insertId;
        req.session.hasPaid = 0;

        res.json({success : 'success'});
    }


});

router.get('/subscribe', loggedInTrue, hasPaidFalse, (req,res,next) => {

    res.render('subscribe', {
        title : 'Subscribe'
    });


});

router.post('/subscribe', loggedInTrue, hasPaidFalse, async (req,res,next) => {

        const token = req.body.stripeToken;

        stripe.charges.create({
            amount : 150,
            currency : 'usd',
            description : `JavaScript Quizzes Subscription; Customer Id: ${req.session.userId}`,
            source : token

        })
        .then(result => {

            let qry = `
            UPDATE users
            SET has_paid = 1
            WHERE id = ?
            `;

            console.log(req.session);

            return db.execute(qry, [req.session.userId]);


        })
        .then(result => {

            req.session.hasPaid = true;
            
            res.redirect('/test');

        })
        .catch(e => console.log(e))


});


router.get('/login', loggedInFalse, (req,res,next) => {

    res.render('login',{
        title : 'Login'
    });



});

router.get('/logout', loggedInTrue, (req,res,next) => {

    req.session.destroy();

    res.redirect('/');

});



module.exports = router;