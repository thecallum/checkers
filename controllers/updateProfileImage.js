const { updateProfileImage: updateImage } = require('../models/user');
const removeImage = require('./removeImage');

const updateProfileImage = (id, fileName, currentImage) =>
    new Promise(async (resolve, reject) => {
        if (currentImage) {
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