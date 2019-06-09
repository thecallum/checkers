const con = require('../db/connection');

exports.checkUsernameAvailable = username =>
	new Promise(async resolve => {
		const query = `SELECT id FROM user WHERE username = '${username}';`;

		con.query(query, (err, response) => {
			resolve(!!response[0]);
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
		const query = `SELECT id, username, password FROM user WHERE email = '${email}';`;

		con.query(query, (err, response) => {
			resolve(response.length === 0 ? null : response[0]);
		});
	});
