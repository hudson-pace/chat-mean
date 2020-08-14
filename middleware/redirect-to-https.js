const config = require('../config');

function redirectToHttps(req, res, next) {
  if (config.environment !== 'production' || req.secure) {
    return next();
  }
  const newHost = `${req.headers.host.substring(0, req.headers.host.indexOf(':'))}:3001`;
  return res.redirect(`https://${newHost}${req.url}`);
}

module.exports = redirectToHttps;
