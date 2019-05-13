const protectedRoute = (req, res, next) => {
    if (!!req.user) return next();

    // save original url
    // Once the user logs in, they can be redirected to that page

    const url = req.url;
    res.redirect(`/login?path=${url}`)
}

module.exports = protectedRoute;