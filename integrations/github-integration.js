const { Octokit } = require("octokit");
require('dotenv').config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function syncWithGitHub() {
    try {
        // Get repository issues
        const { data: issues } = await octokit.rest.issues.listForRepo({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
        });

        // Create tasks in Notion for each issue
        for (const issue of issues) {
            await notion.pages.create({
                parent: { database_id: DATABASE_ID },
                properties: {
                    Name: {
                        title: [{ text: { content: `GitHub: ${issue.title}` } }]
                    },
                    Priority: {
                        select: {
                            name: issue.labels.some(l => l.name === 'high') ? '🔴 High' : '🟡 Medium'
                        }
                    },
                    Status: {
                        select: {
                            name: issue.state === 'open' ? 'Behind' : 'On Track'
                        }
                    },
                    Tags: {
                        multi_select: [{ name: '💻 GitHub' }]
                    }
                }
            });
        }
    } catch (error) {
        console.error('GitHub sync error:', error);
    }
}

module.exports = { syncWithGitHub }; 