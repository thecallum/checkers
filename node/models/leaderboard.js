const con = require('../db/connection');

exports.update = (field, userID) =>
    new Promise(async resolve => {
        const query = `INSERT INTO leaderboard (id, ${field}) VALUES (${userID}, 1) ON DUPLICATE KEY UPDATE ${field} = ${field} + 1;`;

        con.query(query, (err, response) => {
            resolve(err ? false : true);
        });
    });

exports.get = offset =>
    new Promise(async (resolve, reject) => {
        const interval = 50;

        const query1 = `SELECT user.id AS id, username, IFNULL(win, 0) AS win, IFNULL(lose, 0) AS lose, IFNULL(draw, 0) AS draw, IFNULL(win + lose + draw, 0) AS games FROM user 
        LEFT JOIN leaderboard ON leaderboard.id = user.id
        ORDER BY (win * 2) + (lose * -2) + draw DESC, games 
        DESC LIMIT ${interval} offset ${offset * interval};`;

        const query2 = `SELECT COUNT(id) AS total FROM user;`;

        con.query(query1 + query2, (err, response) => {
            if (err) reject(err);

            const data = response[0];
            const total = response[1][0].total;
            const next = data.length + offset * interval < total;
            const back = offset > 0;

            resolve({ data, total, next, back });
        });
    });
