# 43v3r Project Management System

A Node.js application that integrates GitHub with Notion to create a powerful project management system.

## Features

- **Notion Database Integration**: Automatically sync project data to Notion databases
- **GitHub Webhook Integration**: Real-time updates when code changes happen on GitHub
- **Event Tracking**: Track issues, pull requests, commits, and releases
- **Project Dashboard**: Centralized view of all project activities in Notion

## Setup

### Prerequisites

- Node.js (v14+)
- A Notion account with an integration token
- A GitHub account with repository access

### Environment Variables

Create a `.env` file with the following variables:

```
NOTION_KEY=your-notion-integration-token
DATABASE_ID=your-notion-database-id
NOTION_PROJECTS_DATABASE_ID=your-notion-projects-database-id
PORT=3000
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-github-repository
SERVER_URL=your-server-url
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

## GitHub Webhook Setup

1. Go to your GitHub repository
2. Navigate to Settings > Webhooks
3. Click "Add webhook"
4. Set the Payload URL to `http://your-domain:3000/api/webhook/github`
5. Set the Content type to `application/json`
6. Set the Secret to match your `GITHUB_WEBHOOK_SECRET`
7. Select the events you want to trigger the webhook (recommended: pushes, pull requests, issues, releases)
8. Save the webhook

## Testing

Run the integration test:

```
node test-github-integration.js
```

## Creating Notion Databases

The application will create and update the following Notion databases:

1. **Projects Database**: Tracks all your GitHub projects
2. **Financial Database**: Tracks financial data related to your projects

To create or update these databases, run:

```
node create-databases.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 