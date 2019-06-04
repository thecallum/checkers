const con = require('../server/db/connection');
const asyncQuery = require('../server/db/asyncQuery');

const checkUsernameAvailable = username => new Promise(async (resolve, reject) => {
    const query = `SELECT id FROM user WHERE username = '${username}';`;

    const result = await asyncQuery(con, query);
    const exists = !!result[0];

    resolve(exists);
});

module.exports = checkUsernameAvailable;