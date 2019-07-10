const { checkUsernameAvailable: checkUsername } = require('../models/user');

const checkUsernameAvailable = username =>
    new Promise(async resolve => {
        const result = await checkUsername(username);
        resolve(result);
    });

module.exports = checkUsernameAvailable;
