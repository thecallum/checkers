const con = require('../server/db/connection');
const asyncQuery = require('../server/db/asyncQuery');

exports.checkUsernameAvailable = username => new Promise(async (resolve, reject) => {
    const query = `SELECT id FROM user WHERE username = '${username}';`;

    const result = await asyncQuery(con, query);
    const exists = !!result[0];

    resolve(exists);
});

exports.register = (username, email, passwordHash) => new Promise(async (resolve, reject) => {
    const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${passwordHash}');`;

    con.query(query, (err, response) => {
        if (err) return reject(err);
        resolve(response);
    });

//    try {
//         const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${passwordHash}');`;

//         const response = await asyncQuery(con, query);

//         resolve(response);
//         // if (!response) return reject(response);
//         // resolve(response);
//     } catch(e) {
//         console.log('register error', e.message)
//         reject(e)
//     }
});

exports.login = email => new Promise(async (resolve, reject) => {
    const query = `SELECT id, username, password FROM user WHERE email = '${email}';`;

    const result = await asyncQuery(con, query);

    resolve(result.length === 0 ? null : result[0]);
});