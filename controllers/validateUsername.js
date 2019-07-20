module.exports = username => {
    if (!username.match(/^.{2,14}$/)) return false;
    if (!username.match(/^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]*$/)) return false;

    // is valid
    return true;
};
