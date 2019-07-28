const bcrypt = require('bcrypt');
const { login } = require('../models/user');

module.exports = (email, password) =>
    new Promise(async resolve => {
        const user = await login(email);

        if (!user) {
            // user doesnt exist
            // going to decrypt a random password to simulate the time, otherwise, you can tell if an email address exists by the resposonse time
            const generic = '$2b$15$pKhBptaA7pMZeABdXYLSmOIRioJRINEB9wuwwwxJadNkptAo64Fwa';
            await bcrypt.compare(password, generic);
            return resolve(null);
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return resolve(null);

        // login successful
        resolve(user);
    });
