const con = require('../db/connection');
const mysql = require('mysql');

exports.checkUsernameAvailable = username =>
    new Promise(resolve => {
        const query = `SELECT ?? FROM ?? WHERE ?? = ?;`;
        const params = ['id', 'user', 'username', username];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            resolve(response.length === 0);
        });
    });

exports.register = (username, email, passwordHash) =>
    new Promise((resolve, reject) => {
        const query = `INSERT INTO ?? (??, ??, ??) VALUES (?, ?, ?);`;
        const params = ['user', 'username', 'email', 'password', username, email, passwordHash];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.login = email =>
    new Promise(resolve => {
        const query = `SELECT ??, ??, ??, ?? FROM ?? LEFT JOIN ?? ON ?? = ?? WHERE ?? = ? ;`;
        const params = ['user.id', 'username', 'password', 'profile_image', 'user', 'profile', 'user.id', 'profile.id', 'email', email];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            console.log('login', { err, response });
            resolve(response.length === 0 ? null : response[0]);
        });
    });

exports.updateUsername = (id, username) =>
    new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ?? = ? where ?? = ?;`;
        const params = ['user', 'username', username, 'id', id];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.updateEmail = (id, email) =>
    new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ?? = ? where ?? = ?;`;
        const params = ['user', 'email', email, 'id', id];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.updatePassword = (id, password) =>
    new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ?? = ? where ?? = ?;`;
        const params = ['user', 'password', password, 'id', id];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.getPassword = id =>
    new Promise((resolve, reject) => {
        const query = `SELECT ?? FROM ?? WHERE ?? = ?;`;
        const params = ['password', 'user', 'id', id];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response.length === 0 ? null : response[0].password);
        });
    });

exports.updateProfileImage = (id, url) =>
    new Promise((resolve, reject) => {
        const query = `INSERT INTO ?? (??, ??) VALUES (?, ?) ON DUPLICATE KEY UPDATE ?? = '?;`;
        const params = ['profile', 'id', 'profile_image', id, url, 'profile_image', url];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.deleteProfileImage = id =>
    new Promise((resolve, reject) => {
        const query = `DELETE FROM ?? WHERE ?? = ?;`;
        const params = ['profile', 'id', id];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.deleteAccount = id =>
    new Promise((resolve, reject) => {
        const query = `DELETE FROM ?? WHERE ?? = ?;`;
        const params = ['user', 'id', id];
        const formattedQuery = mysql.format(query, params);

        con.query(formattedQuery, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
