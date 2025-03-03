const cron = require('node-cron');
const logger = require('./logger');

// Monitor API health
cron.schedule('*/5 * * * *', async () => {
    try {
        const response = await fetch(`${process.env.SERVER_URL}/health`);
        if (!response.ok) {
            logger.error('Health check failed');
        }
    } catch (error) {
        logger.error('Monitor error:', error);
    }
}); 