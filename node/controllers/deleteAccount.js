const { deleteAccount, login } = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = (id, password, email) =>
    new Promise(async resolve => {
        const user = await login(email);

        const result = await bcrypt.compare(password, user.password);
        if (!result) return resolve({ status: false, message: 'invalid password' });

        await deleteAccount(id);
        resolve({ status: true });
    });
