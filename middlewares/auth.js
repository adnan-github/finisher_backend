function auth(req, res, next) {
// passport will add user in req.user, if it exists then user is authenticated
    if (!req.user) {
        var err = new Error('you are not authorized');
        
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 403;
        return next(err);
    } else {
        next();
    }
}

module.exports = auth;