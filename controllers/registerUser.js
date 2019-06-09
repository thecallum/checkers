const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 15;

const { register } = require('../models/user');

const validateEmail = email => !!validator.isEmail(email);

const validatePassword = password => {
	if (!password.match(/^.{10,128}$/)) return false;
	if (password.match(/(.)\1{2,}/)) return false;

	// password matches min 3 of following rules
	let rulesMet = 0;

	if (password.match(/[A-Z]/)) rulesMet++; // 'At least 1 uppercase character (A-Z)'
	if (password.match(/[a-z]/)) rulesMet++; // 'At least 1 lowercase character (a-z)'
	if (password.match(/[0-9]/)) rulesMet++; // 'At least 1 digit (0-9)'
	if (password.match(/[!@#$%^&*(),.?":{}|<> ]/)) rulesMet++; // 'At least 1 special character (punctuation and space count as special characters)'

	if (rulesMet < 3) return false;

	// is valid
	return true;
};

const validateUsername = username => {
	if (!username.match(/^.{2,14}$/)) return false;
	if (!username.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/)) return false;

	// is valid
	return true;
};

const registerUser = (username, email, password) =>
	new Promise(async (resolve, reject) => {
		// verify details
		// these should already have been validated clientside
		// therefore, if they are incorrect, they wil recieve a generic response

		if (!validateEmail(email) || !validatePassword(password) || !validateUsername(username)) return resolve({ success: false, message: 'invalid' });

		const passwordHash = await bcrypt.hash(password, saltRounds);

		register(username, email, passwordHash)
			.then(newUser => resolve({ success: true, newUser }))
			.catch(e => {
				if (!!e.message && e.message.includes('ER_DUP_ENTRY') && e.message.includes('email')) {
					return resolve({ success: false, message: 'Email taken' });
				}

				if (!!e.message && e.message.includes('ER_DUP_ENTRY') && e.message.includes('username')) {
					return resolve({
						success: false,
						message: 'Username taken',
					});
				}

				reject(e.message);
			});
	});

module.exports = registerUser;
