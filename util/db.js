const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host : process.env.DBHOST || 'localhost', 
    user : process.env.DBUSER || 'root',
    database : process.env.DBNAME || 'jstest', 
    password : process.env.DBPASS || ''
});

module.exports = pool.promise();