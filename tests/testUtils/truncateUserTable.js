const con = require('../../db/connection');

const truncateUserTable = () =>
    new Promise((resolve, reject) => {
        const query = `DELETE FROM user`;
        con.query(query, (err, result) => {
            if (err) return reject(err);
            resolve();
        });
    });

module.exports = truncateUserTable;
