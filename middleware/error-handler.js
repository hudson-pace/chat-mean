/* catches all errors and returns an error response. */

function errorHandler(err, req, res, next) {
  if (typeof err === 'string') {
    let statusCode = 400;
    if (err.toLowerCase().endsWith('not found')) {
      statusCode = 404;
    }
    return res.status(statusCode).json({ message: err });
  } if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  } if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.status(500).json({ message: err.message });
}

module.exports = errorHandler;
