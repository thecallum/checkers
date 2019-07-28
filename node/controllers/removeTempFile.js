const fs = require('fs');
const path = require('path');
const logger = require('../logger');

module.exports = filePath =>
    new Promise((resolve, reject) => {
        fs.unlink(path.resolve(__dirname, filePath), err => {
            if (err) {
                logger.error(err);
                return reject(err);
            }
            resolve(true);
        });
    });
