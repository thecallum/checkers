const { checkUsernameAvailable: checkUsername } = require('../models/user');

module.exports = username =>
    new Promise(async resolve => {
        const result = await checkUsername(username);
        resolve(result);
    });
