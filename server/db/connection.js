const db = require('mysql');

const config = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'callum'
};

const con = db.createConnection(config);

module.exports = con;