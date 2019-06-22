const { updateUsername } = require('../models/user');

module.exports = (username, id) =>
    new Promise((resolve, reject) => {
        updateUsername(id, username)
            .then(resolve)
            .catch(({ code }) => reject(code));
    });
