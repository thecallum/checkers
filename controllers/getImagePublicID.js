module.exports = imageURL =>
    imageURL === undefined
        ? false
        : imageURL
              .split('/')
              .slice(-1)[0]
              .split('.')[0];
