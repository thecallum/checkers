const validator = require('validator');
const bcrypt = require('bcrypt');
const saltRounds = 15;

const { register } = require('../models/user');

const validateEmail = email => !!validator.isEmail(email);
const validatePassword = require('./validatePassword');
const validateUsername = require('./validateUsername');
const logger = require('../logger');

module.exports = (username, email, password) =>
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

                logger.log(e);
                reject(e.message);
            });
    });
