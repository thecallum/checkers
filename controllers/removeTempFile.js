const fs = require('fs');
const path = require('path');

module.exports = filePath =>
    new Promise(resolve => {
        fs.unlink(path.resolve(__dirname, filePath), err => {
            if (err) {
                console.log('remove image err', err);
                return resolve(false);
            }
            resolve(true);
        });
    });
