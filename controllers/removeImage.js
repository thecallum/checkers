const fs = require('fs');
const path = require('path');

const removeImage = fileName =>
    new Promise(resolve => {
        fs.unlink(path.resolve('__dirname', '..', 'public', 'uploadedImages', fileName), err => {
            if (err) {
                console.log('remove image err', err);
                return resolve(false);
            }
            resolve(true);
        });
    });

module.exports = removeImage;
