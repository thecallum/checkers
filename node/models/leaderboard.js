const con = require('../db/connection');
const mysql = require('mysql');

exports.update = (field, userID) =>
    new Promise(async resolve => {
        const query = `INSERT INTO ?? (??, ?) VALUES (?, ??) ON DUPLICATE KEY UPDATE ?? = ?? + 1;`;
        const params = ['leaderboard', 'id', field, userID, 1, field, field];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            resolve(err ? false : true);
        });
    });

exports.get = offset =>
    new Promise(async (resolve, reject) => {
        const interval = 50;

        const query1 = `SELECT ?? AS id, ??, IFNULL(??, 0) AS win, IFNULL(??, 0) AS lose, IFNULL(??, 0) AS draw, IFNULL(?? + ?? + ??, 0) AS games FROM ??
        LEFT JOIN ?? ON ?? = ??
        ORDER BY (?? * 2) + (?? * -2) + ?? DESC, ??
        DESC LIMIT ? offset ?;`;
        const params1 = [
            'user.id',
            'username',
            'win',
            'lose',
            'draw',
            'win',
            'lose',
            'draw',
            'user',
            'leaderboard',
            'leaderboard.id',
            'user.id',
            'win',
            'lose',
            'draw',
            'games',
            interval,
            offset * interval,
        ];
        const formattedQuery1 = mysql.format(query1, params1);

        const query2 = `SELECT COUNT(??) AS total FROM ??;`;
        const params2 = ['id', 'user'];
        const formattedQuery2 = mysql.format(query2, params2);

        const promises = [
            new Promise(resolve => {
                con.query(formattedQuery1, (err, response) => {
                    resolve(response);
                });
            }),
            new Promise(resolve => {
                con.query(formattedQuery2, (err, response) => {
                    resolve(response);
                });
            }),
        ];

        Promise.all(promises).then(response => {
            const data = response[0];
            const total = response[1][0].total;
            const next = data.length + offset * interval < total;
            const back = offset > 0;

            resolve({ data, total, next, back });
        });
    });
