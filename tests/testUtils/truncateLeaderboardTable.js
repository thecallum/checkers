const con = require('../../db/connection');

const truncateLeaderboard = () =>
    new Promise((resolve, reject) => {
        const query = `DELETE FROM leaderboard;`;
        con.query(query, (err, result) => {
            if (err) return reject(err);
            resolve();
        });
    });

module.exports = truncateLeaderboard;
