const { deleteProfileImage } = require('../models/user');
const getImagePublicID = require('./getImagePublicID');
const cloudinary = require('cloudinary').v2;
const logger = require('../logger');

module.exports = (id, currentImage) =>
    new Promise(async (resolve, reject) => {
        try {
            if (!currentImage) return resolve(false);
            const previousID = getImagePublicID(currentImage);

            cloudinary.uploader.destroy(previousID, (err, result) => {
                if (err) throw err;

                deleteProfileImage(id)
                    .then(() => resolve())
                    .catch(err => {
                        throw err;
                    });
            });
        } catch (e) {
            logger.error(e);
            reject(e);
        }
    });
