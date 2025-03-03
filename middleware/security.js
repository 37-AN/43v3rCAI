import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

const securityMiddleware = {
    rateLimiter: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: process.env.MAX_REQUEST_LIMIT || 100,
        message: 'Too many requests, please try again later.'
    }),

    helmetConfig: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://api.github.com"]
            }
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }),

    corsConfig: cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400
    })
};

export default securityMiddleware; 