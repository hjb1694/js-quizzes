const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionStore = require('express-mysql-session')(session);
require('dotenv').config();

//Routes
const testRoutes = require('./routes/test');
const userRoutes = require('./routes/user');

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.set('views',path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public')));


const storeOpts = {
    host : process.env.DBHOST, 
    port : process.env.DBPORT,
    user : process.env.DBUSER, 
    password : process.env.DBPASS, 
    database : process.env.DBNAME
}

const store = new sessionStore(storeOpts);

app.use(session({
    secret : 'thisistheultimatesecret123', 
    resave : false, 
    saveUninitialized : true, 
    store
}));


app.get('/',(req,res,next) => {
    res.render('index',{
        title : 'Welcome'
    });
});

app.use('/test',testRoutes);
app.use('/user',userRoutes);


app.listen(port, host, ()=>{
    console.log(`Listening on port ${port}; host: ${host}`);
});