const con = require('../server/db/connection');
const asyncQuery = require('../server/db/asyncQuery');

const getUserWithEmail = email => new Promise(async (resolve, reject) => {
    const query = `SELECT id, username, password FROM user WHERE email = '${email}';`;

    const result = await asyncQuery(con, query);

    if (result.length === 0) {
        resolve(null);
    } else {
        resolve(result[0]);
    }
});

module.exports = getUserWithEmail;