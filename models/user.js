const con = require('../db/connection');

exports.checkUsernameAvailable = username =>
    new Promise(async resolve => {
        const query = `SELECT id FROM user WHERE username = '${username}';`;

        con.query(query, (err, response) => {
            resolve(response.length === 0);
        });
    });

exports.register = (username, email, passwordHash) =>
    new Promise(async (resolve, reject) => {
        const query = `INSERT INTO user (username, email, password) VALUES ('${username}','${email}','${passwordHash}');`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.login = email =>
    new Promise(async resolve => {
        const query = `SELECT id, username, password, profile_image FROM user WHERE email = '${email}';`;

        con.query(query, (err, response) => {
            resolve(response.length === 0 ? null : response[0]);
        });
    });

exports.updateUsername = (id, username) =>
    new Promise(async (resolve, reject) => {
        const query = `UPDATE user SET username = '${username}' where id = '${id}';`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.updateEmail = (id, email) =>
    new Promise(async (resolve, reject) => {
        const query = `UPDATE user SET email = '${email}' where id = '${id}';`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.updatePassword = (id, password) =>
    new Promise(async (resolve, reject) => {
        const query = `UPDATE user SET password = '${password}' where id = '${id}';`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.getPassword = id =>
    new Promise(async (resolve, reject) => {
        const query = `SELECT password FROM user WHERE id = ${id};`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response.length === 0 ? null : response[0].password);
        });
    });

exports.updateProfileImage = (id, url) =>
    new Promise(async (resolve, reject) => {
        const query = `UPDATE user SET profile_image = '${url}' where id = '${id}';`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });

exports.deleteProfileImage = id =>
    new Promise(async (resolve, reject) => {
        const query = `UPDATE user SET profile_image = NULL WHERE id = ${id};`;

        con.query(query, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
