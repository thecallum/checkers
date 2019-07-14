const { deleteProfileImage: deleteImage } = require('../models/user');
const getImagePublicID = require('./getImagePublicID');

const cloudinary = require('cloudinary').v2;

const deleteProfileImage = (id, currentImage) =>
    new Promise(async (resolve, reject) => {
        const previousID = getImagePublicID(currentImage);

        cloudinary.uploader.destroy(previousID, (err, result) => {
            if (err) reject(err);

            deleteImage(id)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    });

module.exports = deleteProfileImage;
