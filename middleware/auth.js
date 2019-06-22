const auth = (req, res, next) => {
    if (!!req.session && !!req.session.user) return next();

    if (req.method === 'POST') {
        res.status(401).send();
    } else {
        res.redirect(`/login`);
    }
};

module.exports = auth;
