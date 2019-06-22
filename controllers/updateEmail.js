const { updateEmail } = require('../models/user');

module.exports = (email, id) =>
    new Promise((resolve, reject) => {
        updateEmail(id, email)
            .then(resolve)
            .catch(({ code }) => reject(code));
    });
