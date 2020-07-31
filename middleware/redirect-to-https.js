const config = require('../config');

module.exports = redirectToHttps;

function redirectToHttps(req, res, next) {
    if (config.environment !== "production" || req.secure) {
        return next();
    }
    let newHost = req.headers.host.substring(0, req.headers.host.indexOf(':')) + ':3001';
    return res.redirect('https://' + newHost + req.url);
}