import { Octokit } from "@octokit/rest";
import { notion } from '../create-databases.js';
import dotenv from 'dotenv';

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
// Use the DATABASE_ID from environment or create-databases.js
const DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID || "1aa7674c-da3a-8118-9590-dd4020f8f0d9";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "37-AN";
const GITHUB_REPO = process.env.GITHUB_REPO || "43v3rCAI";

async function findOrCreateProjectPage(projectName) {
    // Check if project already exists in Notion
    const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
            property: "Name",
            title: {
                equals: projectName
            }
        }
    });

    if (response.results.length > 0) {
        return response.results[0].id;
    }

    // Create new project page
    const newPage = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
            Name: {
                title: [{ text: { content: projectName } }]
            },
            Status: {
                select: {
                    name: "Active"
                }
            },
            Priority: {
                select: {
                    name: "🔵 Medium"
                }
            },
            Tags: {
                multi_select: [
                    { name: "💻 GitHub" }
                ]
            }
        }
    });

    return newPage.id;
}

async function syncGitHubToNotion() {
    try {
        // Get repository info
        const { data: repo } = await octokit.rest.repos.get({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO
        });

        // Get latest commits
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            per_page: 5
        });

        // Get open issues
        const { data: issues } = await octokit.rest.issues.listForRepo({
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            state: "open",
            per_page: 5
        });

        // Find or create project page
        const pageId = await findOrCreateProjectPage(`${GITHUB_REPO} Development`);

        // Update the page with latest data
        await notion.pages.update({
            page_id: pageId,
            properties: {
                Status: {
                    select: {
                        name: repo.archived ? "Archived" : "Active"
                    }
                }
            }
        });

        // Add recent activity as children blocks
        await notion.blocks.children.append({
            block_id: pageId,
            children: [
                {
                    object: "block",
                    type: "heading_2",
                    heading_2: {
                        rich_text: [{ text: { content: "Recent Development Activity" } }]
                    }
                },
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [{ text: { content: `Last updated: ${new Date().toLocaleString()}` } }]
                    }
                },
                {
                    object: "block",
                    type: "heading_3",
                    heading_3: {
                        rich_text: [{ text: { content: "Recent Commits" } }]
                    }
                },
                ...commits.map(commit => ({
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                text: {
                                    content: `${commit.commit.message} `,
                                }
                            },
                            {
                                text: {
                                    content: `(${commit.sha.substring(0, 7)})`,
                                    link: {
                                        url: commit.html_url
                                    }
                                }
                            }
                        ]
                    }
                })),
                {
                    object: "block",
                    type: "heading_3",
                    heading_3: {
                        rich_text: [{ text: { content: "Open Issues" } }]
                    }
                },
                ...issues.map(issue => ({
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                text: {
                                    content: `#${issue.number}: ${issue.title}`,
                                    link: {
                                        url: issue.html_url
                                    }
                                }
                            }
                        ]
                    }
                }))
            ]
        });

        console.log(`Successfully synced GitHub repo ${GITHUB_OWNER}/${GITHUB_REPO} to Notion`);
        return pageId;
    } catch (error) {
        console.error('Error syncing GitHub to Notion:', error);
        throw error;
    }
}

// Handle different GitHub webhook events
async function handleGitHubWebhook(event) {
    try {
        console.log(`Received GitHub webhook event: ${event.type}`);
        
        switch (event.type) {
            case 'push':
                await syncGitHubToNotion();
                break;
                
            case 'issues':
                await handleIssueEvent(event.payload);
                break;
                
            case 'pull_request':
                await handlePullRequestEvent(event.payload);
                break;
                
            case 'release':
                await handleReleaseEvent(event.payload);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error(`Error handling webhook event ${event.type}:`, error);
        throw error;
    }
}

async function handleIssueEvent(payload) {
    const { action, issue, repository } = payload;
    
    // Find or create the project page
    const pageId = await findOrCreateProjectPage(`${repository.name} Development`);
    
    // Add issue update to the page
    await notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Issue ${action}: #${issue.number} ${issue.title}`,
                                link: {
                                    url: issue.html_url
                                }
                            }
                        }
                    ]
                }
            }
        ]
    });
}

async function handlePullRequestEvent(payload) {
    const { action, pull_request, repository } = payload;
    
    // Find or create the project page
    const pageId = await findOrCreateProjectPage(`${repository.name} Development`);
    
    // Add PR update to the page
    await notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Pull Request ${action}: #${pull_request.number} ${pull_request.title}`,
                                link: {
                                    url: pull_request.html_url
                                }
                            }
                        }
                    ]
                }
            }
        ]
    });
}

async function handleReleaseEvent(payload) {
    const { action, release, repository } = payload;
    
    // Find or create the project page
    const pageId = await findOrCreateProjectPage(`${repository.name} Development`);
    
    // Add release update to the page
    await notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Release ${action}: ${release.tag_name} - ${release.name}`,
                                link: {
                                    url: release.html_url
                                }
                            }
                        }
                    ]
                }
            }
        ]
    });
}

export { syncGitHubToNotion, handleGitHubWebhook }; 