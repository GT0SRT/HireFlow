const logger = require('../utils/logger');

// Express error handler
function errorMiddleware(err, req, res, next) {
    const status = err.status || 500;
    const message = err.expose ? err.message : 'Internal server error';

    logger.error('Error: %s %s - %s', req.method, req.originalUrl, err.stack || err.message);

    res.status(status).json({
        success: false,
        message,
    });
}

module.exports = errorMiddleware;
