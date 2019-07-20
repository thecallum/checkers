const bcrypt = require('bcrypt');
const saltRounds = 15;
const { updatePassword, getPassword } = require('../models/user');
const logger = require('../logger');

module.exports = (currentPassword, newPassword, id) =>
    new Promise(async (resolve, reject) => {
        try {
            const storedPassword = await getPassword(id);
            if (!storedPassword) return resolve(null);

            const validPassword = await bcrypt.compare(currentPassword, storedPassword);
            if (!validPassword) return resolve(false);

            const passwordHash = await bcrypt.hash(newPassword, saltRounds);
            await updatePassword(id, passwordHash);

            resolve(true);
        } catch (e) {
            logger.error(e);
            reject(false);
        }
    });
