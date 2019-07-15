module.exports = imageURL =>
    !imageURL
        ? false
        : imageURL
              .split('/')
              .slice(-1)[0]
              .split('.')[0];
