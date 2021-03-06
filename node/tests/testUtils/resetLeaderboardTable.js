const con = require('../../db/connection');

module.exports = () =>
    new Promise((resolve, reject) => {
        const query = `DELETE FROM leaderboard;`;
        con.query(query, (err, result) => {
            if (err) return reject(err);
            resolve();
        });
    });
