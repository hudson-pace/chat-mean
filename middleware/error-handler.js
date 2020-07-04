/* catches all errors and returns an error response. */

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof err === 'string') {
        var statusCode = 400;
        if (err.toLowerCase().endsWith('not found')) {
            statusCode = 404;
        }
        return res.status(statusCode).json({message: err});
    }
    else if (err.name === 'ValidationError') {
        return res.status(400).json({message: err.message});
    }
    else if (err.name === 'UnauthorizedError') {
        return res.status(401).json({message: "Unauthorized"});
    }
    else {
        return res.status(500).json({message: err.message});
    }
}