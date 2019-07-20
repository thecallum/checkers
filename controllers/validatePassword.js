module.exports = password => {
    if (!password.match(/^.{10,128}$/)) return false;
    if (password.match(/(.)\1{2,}/)) return false;

    // password matches min 3 of following rules
    let rulesMet = 0;

    if (password.match(/[A-Z]/)) rulesMet++; // 'At least 1 uppercase character (A-Z)'
    if (password.match(/[a-z]/)) rulesMet++; // 'At least 1 lowercase character (a-z)'
    if (password.match(/[0-9]/)) rulesMet++; // 'At least 1 digit (0-9)'
    if (password.match(/[!@#$%^&*(),.?":{}|<> ]/)) rulesMet++; // 'At least 1 special character (punctuation and space count as special characters)'

    if (rulesMet < 3) return false;

    // is valid
    return true;
};
