const sevenDays = 1000 * 60 * 60 * 24 * 7;
const oneHour = 1000 * 60 * 60;

const getTime = stayLoggedIn => {
    let time;

    if (stayLoggedIn) {
        time = new Date(Date.now() + sevenDays);
    } else {
        time = new Date(Date.now() + oneHour);
    }
    
    return time;
}

const options = stayLoggedIn => ({
    secure: process.env.development ? false : true,
    httpOnly: true,
    domain: process.env.domain || 'localhost',
    expires: getTime(stayLoggedIn),
});

module.exports = options;