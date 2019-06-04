const con = require('../server/db/connection');
const asyncQuery = require('../server/db/asyncQuery');

const registerUser = (username, email, passwordHash) => new Promise(async (resolve, reject) => {
    const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${passwordHash}');`;

    const response = await asyncQuery(con, query);

    if (!response) return reject(response);
    resolve(response);
});

module.exports = registerUser;