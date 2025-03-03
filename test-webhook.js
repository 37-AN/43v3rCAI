import crypto from 'crypto';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const WEBHOOK_URL = `${process.env.SERVER_URL}/api/webhook/github`;

// Sample GitHub webhook payload
const payload = {
    repository: {
        name: "43v3rCAI",
        owner: {
            login: "37-AN"
        }
    },
    commits: [
        {
            message: "Test commit: Testing webhook integration",
            sha: "1234567890abcdef",
            html_url: "https://github.com/37-AN/43v3rCAI/commit/1234567"
        }
    ]
};

// Calculate signature
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
const signature = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');

async function testWebhook() {
    try {
        console.log('Sending webhook test event...');
        console.log(`Webhook URL: ${WEBHOOK_URL}`);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-GitHub-Event': 'push',
                'X-Hub-Signature-256': signature
            },
            body: JSON.stringify(payload)
        });

        const data = await response.text();
        console.log(`Response status: ${response.status}`);
        console.log(`Response body: ${data}`);
    } catch (error) {
        console.error('Error testing webhook:', error);
    }
}

// Run the test
testWebhook(); 