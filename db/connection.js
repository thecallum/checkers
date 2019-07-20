const db = require('mysql');

const testingConfig = {
    host: process.env.DB_HOST,
    user: 'root',
    password: 'password',
    database: 'test',
    multipleStatements: true,
};

if (!process.env.TESTING) {
    if (!process.env.DB_HOST) throw 'Missing env variable DB_HOST';
    if (!process.env.DB_USER) throw 'Missing env variable DB_USER';
    if (!process.env.DB_PASSWORD) throw 'Missing env variable DB_PASSWORD';
    if (!process.env.DB_DATABASE) throw 'Missing env variable DB_DATABASE';
}

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
};

module.exports = db.createConnection(process.env.TESTING ? testingConfig : config);
