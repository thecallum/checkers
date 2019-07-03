const { updateProfileImage: updateImage } = require('../models/user');

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

const updateProfileImage = (id, fileName, currentImage) =>
    new Promise(async (resolve, reject) => {
        if (currentImage !== undefined) {
            const fileName = currentImage.split('/')[2];
            await removeImage(fileName);
        }

        const url = `/uploadedImages/${fileName}`;

        updateImage(id, url)
            .then(() => {
                resolve({ url });
            })
            .catch(err => reject(err));
    });

module.exports = updateProfileImage;
