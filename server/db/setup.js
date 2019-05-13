const con = require('./connection');

const asyncQuery = (con, query) => new Promise((resolve, reject) => {
    con.query(query, (err, queryResult) => {
        if (err) reject(new Error(err));
        resolve(queryResult);
    })
});

const setup = () => new Promise(async (resolve, reject) => {
    await con.connect();
    console.log('Connected to database!');

    let tables = await asyncQuery(con, 'SHOW TABLES;');
    tables = tables.map(item => {
        const key = Object.keys(item);
        return item[key];
    })

    if (tables.indexOf('user') === -1) {
        await asyncQuery(con, `
            CREATE TABLE user (
                id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(50) NOT NULL,
                username VARCHAR(30) NOT NULL,
                UNIQUE(email)
            );
        `);
    }


    resolve();
});

module.exports = setup;