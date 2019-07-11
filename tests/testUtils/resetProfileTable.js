const con = require('../../db/connection');

module.exports = () =>
    new Promise((resolve, reject) => {
        const query = `DELETE FROM profile;`;
        con.query(query, (err, result) => {
            if (err) return reject(err);
            resolve();
        });
    });
