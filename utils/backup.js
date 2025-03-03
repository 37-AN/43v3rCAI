const fs = require('fs').promises;
const path = require('path');

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const data = await notion.databases.query({
        database_id: process.env.DATABASE_ID
    });
    
    await fs.writeFile(
        path.join('backups', `backup-${timestamp}.json`),
        JSON.stringify(data, null, 2)
    );
} 