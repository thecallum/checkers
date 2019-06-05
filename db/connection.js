const db = require('mysql');

const testingConfig = {
    host: process.env.DB_HOST,
    user: 'root',
    password: 'password',
    database: 'test',
};

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

const con = db.createConnection(process.env.TESTING ? testingConfig : config);

module.exports = con;