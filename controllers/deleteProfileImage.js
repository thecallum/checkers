const { deleteProfileImage: deleteImage } = require('../models/user');
const removeTempFile = require('./removeTempFile');

const deleteProfileImage = (id, currentImage) =>
    new Promise(async (resolve, reject) => {
        if (currentImage !== undefined) {
            const fileName = currentImage.split('/')[2];
            await removeTempFile(fileName);
        }

        deleteImage(id)
            .then(() => resolve())
            .catch(err => reject(err));
    });

module.exports = deleteProfileImage;
