module.exports = redirectToHttps;

function redirectToHttps(req, res, next) {
    if (process.env.NODE_ENV !== "production" || req.headers['x-forwarded-proto'] === 'https') {
        return next();
    }
    return res.redirect('https://' + req.headers.host + req.url);
}