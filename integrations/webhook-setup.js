import express from 'express';
import crypto from 'crypto';
import { handleGitHubWebhook } from './notion-github-sync.js';
import dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export function setupWebhooks() {
    const router = express.Router();

    function verifySignature(req) {
        const signature = req.headers['x-hub-signature-256'];
        const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
        const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
    }

    router.post('/webhook/github', async (req, res) => {
        try {
            if (!verifySignature(req)) {
                return res.status(401).send('Invalid signature');
            }

            await handleGitHubWebhook({
                type: req.headers['x-github-event'],
                payload: req.body
            });

            res.status(200).send('OK');
        } catch (error) {
            console.error('Webhook error:', error);
            res.status(500).send('Error processing webhook');
        }
    });

    return router;
} 