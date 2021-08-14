const mysql = require('mysql');

const connection = mysql.createPool({
    host: '5.181.218.1',
    database: 'u765237646_trabajo',
    user: 'u765237646_testTrabaj',
    password: '0766Yy/7lX'
});

module.exports = connection;