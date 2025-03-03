const AppError = require('../utils/error-handler');

const securityHeaders = (req, res, next) => {
    // Check for required security headers
    if (!req.secure && process.env.NODE_ENV === 'production') {
        return next(new AppError('HTTPS required', 403));
    }

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
};

module.exports = securityHeaders; 