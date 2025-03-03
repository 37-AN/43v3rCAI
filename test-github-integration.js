import { syncGitHubToNotion } from './integrations/notion-github-sync.js';
import dotenv from 'dotenv';

dotenv.config();

async function testGitHubNotionIntegration() {
    try {
        console.log('Starting GitHub to Notion sync test...');
        
        // Test the basic sync function
        const pageId = await syncGitHubToNotion();
        
        console.log(`Successfully synchronized GitHub data to Notion page: ${pageId}`);
        console.log('Test complete!');
        
        // Test simulating webhook events
        console.log('\nIf you want to test the webhook handler, use the following curl command:');
        console.log(`curl -X POST http://localhost:${process.env.PORT}/api/webhook/github \\`);
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -H "X-GitHub-Event: push" \\');
        console.log('  -H "X-Hub-Signature-256: sha256=<calculated-signature>" \\');
        console.log('  -d \'{"repository":{"name":"43v3rCAI","owner":{"login":"37-AN"}},"commits":[{"message":"Test commit","sha":"1234567890abcdef","html_url":"https://github.com/37-AN/43v3rCAI/commit/1234567"}]}\'');
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test
testGitHubNotionIntegration(); 