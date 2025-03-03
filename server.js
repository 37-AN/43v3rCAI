import express from 'express';
import dotenv from 'dotenv';
import security from './middleware/security.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setupWebhooks } from './integrations/webhook-setup.js';
import { syncGitHubToNotion } from './integrations/notion-github-sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Add security middleware
app.use(security.helmetConfig);

// Rate limiting
app.use(security.rateLimiter);

// Add more security middleware
app.use(security.corsConfig);
app.use(cookieParser());

// Add request logging
app.use(morgan('combined'));

// Routes
const router = setupWebhooks();
app.use('/api', router);

// Initial sync route
app.get('/sync', async (req, res) => {
    try {
        await syncGitHubToNotion();
        res.status(200).send('Sync completed successfully');
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).send('Error during sync');
    }
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).send('Server is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL: http://your-domain:${PORT}/api/webhook/github`);
});

export default app; 