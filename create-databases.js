import dotenv from 'dotenv';
import { Client } from '@notionhq/client';

dotenv.config();
const notion = new Client({ auth: process.env.NOTION_KEY });
const DATABASE_ID = "1aa7674c-da3a-8118-9590-dd4020f8f0d9";

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if property exists
async function checkPropertyExists(propertyName) {
    try {
        const response = await notion.databases.retrieve({
            database_id: DATABASE_ID
        });
        return !!response.properties[propertyName];
    } catch (error) {
        console.error(`Error checking property ${propertyName}:`, error.message);
        return false;
    }
}

// Helper function to add a formula with retries
async function addFormulaWithRetry(formula, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const exists = await checkPropertyExists(formula.name);
            if (exists) {
                console.log(`Formula ${formula.name} already exists, skipping...`);
                return;
            }

            // Create the formula property
            const response = await notion.databases.update({
                database_id: DATABASE_ID,
                properties: {
                    [formula.name]: {
                        type: "formula",
                        formula: {
                            expression: formula.expression
                        }
                    }
                }
            });

            console.log(`Added formula: ${formula.name} (Level ${formula.level})`);
            await delay(5000); // Wait longer after successful addition
            return response;
        } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed for ${formula.name}:`, error.message);
            await delay(5000 * attempts);
        }
    }
    throw new Error(`Failed to add formula ${formula.name} after ${maxRetries} attempts`);
}

// Helper function to extract property names from formula expression
function getRequiredProperties(expression) {
    const matches = expression.match(/prop\("([^"]+)"\)/g) || [];
    return matches.map(match => match.match(/prop\("([^"]+)"\)/)[1]);
}

// Add these helper functions at the top
async function getDatabaseProperties() {
    try {
        const response = await notion.databases.retrieve({
            database_id: DATABASE_ID
        });
        return response.properties;
    } catch (error) {
        console.error("Error getting database properties:", error);
        throw error;
    }
}

async function cleanupExistingFormulas() {
    try {
        const properties = await getDatabaseProperties();
        const formulaProperties = Object.entries(properties)
            .filter(([_, prop]) => prop.type === 'formula')
            .map(([name]) => name);

        if (formulaProperties.length > 0) {
            console.log("Removing existing formula properties:", formulaProperties);
            const updates = {};
            formulaProperties.forEach(name => {
                updates[name] = null;
            });

            await notion.databases.update({
                database_id: DATABASE_ID,
                properties: updates
            });
            console.log("Existing formulas removed successfully");
        }
    } catch (error) {
        console.error("Error cleaning up formulas:", error);
    }
}

async function checkMonthExists(month) {
    try {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            filter: {
                property: "Name",
                title: {
                    equals: month
                }
            }
        });
        return response.results.length > 0;
    } catch (error) {
        console.error("Error checking month:", error);
        return false;
    }
}

// Add schema size check
async function validateDatabaseSchema(properties) {
    const schemaSize = JSON.stringify(properties).length;
    if (schemaSize > 50000) { // 50KB limit
        throw new Error(`Schema size (${schemaSize} bytes) exceeds Notion's 50KB limit`);
    }
}

// Update updateDatabaseSchema function
async function updateDatabaseSchema() {
    try {
        // First validate schema size
        const properties = {
            // Title property (required)
            "Name": { 
                "id": "title",
                "type": "title",
                "title": {} 
            },
            // AI Business Revenue (number with currency format)
            "AI Content Agency": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            "AI Stock Analysis": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            "MES Analytics": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            "Workflow Automation": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            // Investments (number with currency format)
            "Stocks Investment": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            "Crypto Investment": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            "Bonds Investment": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            "Savings": { 
                "type": "number",
                "number": {
                    "format": "dollar"
                }
            },
            // Status as select property
            "Status": {
                "type": "select",
                "select": {
                    "options": [
                        {
                            "name": "On Track",
                            "color": "green"
                        },
                        {
                            "name": "Behind",
                            "color": "yellow"
                        },
                        {
                            "name": "At Risk",
                            "color": "red"
                        }
                    ]
                }
            },
            // Notes as rich text
            "Notes": { 
                "type": "rich_text",
                "rich_text": {} 
            },
            // Progress Bar (number with percent)
            "Progress Bar": {
                "type": "number",
                "number": {
                    "format": "percent"
                }
            },
            // Priority Level (select with colors)
            "Priority": {
                "type": "select",
                "select": {
                    "options": [
                        {
                            "name": "🔴 High",
                            "color": "red"
                        },
                        {
                            "name": "🟡 Medium",
                            "color": "yellow"
                        },
                        {
                            "name": "🟢 Low",
                            "color": "green"
                        }
                    ]
                }
            },
            // Timeline (date range)
            "Timeline": {
                "type": "date",
                "date": {}
            },
            // Tags (multi-select)
            "Tags": {
                "type": "multi_select",
                "multi_select": {
                    "options": [
                        {
                            "name": "📈 Investment",
                            "color": "blue"
                        },
                        {
                            "name": "🤖 AI Revenue",
                            "color": "green"
                        },
                        {
                            "name": "💰 Savings",
                            "color": "yellow"
                        }
                    ]
                }
            }
        };

        await validateDatabaseSchema(properties);

        // Clean up existing formulas
        await cleanupExistingFormulas();
        await delay(2000);

        // Update basic properties
        const basicResponse = await notion.databases.update({
            database_id: DATABASE_ID,
            title: [
                {
                    type: "text",
                    text: { content: "AI Business & Investment Tracker" }
                }
            ],
            properties: properties
        });

        // Define formulas with proper type-specific data
        const formulas = [
            {
                name: "Total AI Revenue",
                type: "formula",
                formula: {
                    expression: "add(add(add(prop(\"AI Content Agency\"), prop(\"AI Stock Analysis\")), prop(\"MES Analytics\")), prop(\"Workflow Automation\"))"
                }
            },
            {
                name: "Total Investments",
                type: "formula",
                formula: {
                    expression: "add(add(add(prop(\"Stocks Investment\"), prop(\"Crypto Investment\")), prop(\"Bonds Investment\")), prop(\"Savings\"))"
                }
            },
            {
                name: "Total Income",
                type: "formula",
                formula: {
                    expression: "add(prop(\"Base Salary\"), prop(\"Total AI Revenue\"))"
                }
            },
            {
                name: "Net Monthly Savings",
                type: "formula",
                formula: {
                    expression: "subtract(prop(\"Total Income\"), prop(\"Total Expenses\"))"
                }
            },
            // Monthly Growth Rate
            {
                name: "Monthly Growth Rate",
                type: "formula",
                formula: {
                    expression: "multiply(divide(prop(\"Net Monthly Savings\"), prop(\"Total Income\")), 100)"
                }
            },
            // ROI Calculation
            {
                name: "Investment ROI",
                type: "formula",
                formula: {
                    expression: "multiply(divide(subtract(prop(\"Total AI Revenue\"), prop(\"Total Expenses\")), prop(\"Total Investments\")), 100)"
                }
            },
            // Expense Ratio
            {
                name: "Expense Ratio",
                type: "formula",
                formula: {
                    expression: "multiply(divide(prop(\"Total Expenses\"), prop(\"Total Income\")), 100)"
                }
            }
        ];

        // Add formulas one at a time
        for (const formula of formulas) {
            await delay(2000);
            await addFormulaWithRetry(formula);
        }

        return basicResponse;
    } catch (error) {
        console.error("Error updating database schema:", error);
        throw error;
    }
}

// Move setup function to top level
async function setup() {
    try {
        await updateDatabaseSchema();
        await delay(3000);

        const months = [
            "January 2024",
            "February 2024",
            "March 2024"
        ];

        for (const month of months) {
            await addMonthlyEntry(month, {
                aiContent: 5000,
                aiStocks: 2000,
                mesAnalytics: 0,
                workflow: 2000,
                stocks: 5000,
                crypto: 2000,
                bonds: 2000,
                savings: 1000,
                salary: 50000,
                businessExpenses: 5000,
                personalExpenses: 30000,
                status: "On Track",
                notes: `Financial tracking for ${month}`
            });
            await delay(2000);
        }

        await readEntries();
        console.log("\nSetup completed successfully!");
    } catch (error) {
        console.error("Error during setup:", error);
    }
}

async function addMonthlyEntry(month, data) {
    try {
        // Check if entry for this month already exists
        const exists = await checkMonthExists(month);
        if (exists) {
            console.log(`Entry for ${month} already exists, skipping...`);
            return;
        }

        const response = await notion.pages.create({
            parent: {
                database_id: DATABASE_ID,
            },
            properties: {
                "Name": {
                    title: [{ text: { content: month } }]
                },
                // AI Business Revenue
                "AI Content Agency": { number: data.aiContent || 0 },
                "AI Stock Analysis": { number: data.aiStocks || 0 },
                "MES Analytics": { number: data.mesAnalytics || 0 },
                "Workflow Automation": { number: data.workflow || 0 },
                // Investments
                "Stocks Investment": { number: data.stocks || 0 },
                "Crypto Investment": { number: data.crypto || 0 },
                "Bonds Investment": { number: data.bonds || 0 },
                "Savings": { number: data.savings || 0 },
                // Monthly Salary
                "Base Salary": { number: data.salary || 0 },
                // Expenses
                "Business Expenses": { number: data.businessExpenses || 0 },
                "Personal Expenses": { number: data.personalExpenses || 0 },
                // Status as select
                "Status": { 
                    "select": { 
                        "name": data.status || "On Track"
                    }
                },
                "Notes": { 
                    "rich_text": [{ 
                        "text": { 
                            "content": data.notes || "" 
                        }
                    }]
                },
                // Progress Bar (number with percent)
                "Progress Bar": { number: data.progressBar || 0 },
                // Priority Level (select with colors)
                "Priority": { 
                    "select": { 
                        "name": data.priority || "🟢 Low"
                    }
                },
                // Timeline (date range)
                "Timeline": { date: { start: data.timelineStart || null, end: data.timelineEnd || null } },
                // Tags (multi-select)
                "Tags": {
                    "multi_select": data.tags?.map(tag => ({
                        name: tag,
                        color: tag === "📈 Investment" ? "blue" : tag === "🤖 AI Revenue" ? "green" : "yellow"
                    })) || []
                }
            }
        });
        
        console.log("Successfully added entry for", month);
        return response;
    } catch (error) {
        console.error("Error adding entry:", error);
        throw error;
    }
}

async function readEntries() {
    try {
        const response = await notion.databases.query({
            database_id: DATABASE_ID,
            sorts: [
                {
                    property: "Name",
                    direction: "ascending"
                }
            ]
        });
        
        console.log("\nCurrent entries:");
        response.results.forEach(page => {
            const props = page.properties;
            console.log(`
    Month: ${props.Name.title[0]?.text.content || 'N/A'}
    AI Content Agency: ${props["AI Content Agency"]?.number || 0}
    AI Stock Analysis: ${props["AI Stock Analysis"]?.number || 0}
    MES Analytics: ${props["MES Analytics"]?.number || 0}
    Workflow Automation: ${props["Workflow Automation"]?.number || 0}
    Stocks Investment: ${props["Stocks Investment"]?.number || 0}
    Crypto Investment: ${props["Crypto Investment"]?.number || 0}
    Bonds Investment: ${props["Bonds Investment"]?.number || 0}
    Savings: ${props.Savings?.number || 0}
    Base Salary: ${props["Base Salary"]?.number || 0}
    Business Expenses: ${props["Business Expenses"]?.number || 0}
    Personal Expenses: ${props["Personal Expenses"]?.number || 0}
    Status: ${props.Status?.select?.name || 'N/A'}
    Notes: ${props.Notes?.rich_text[0]?.text.content || ""}
    
    // Calculated totals
    Total AI Revenue: R${props["Total AI Revenue"]?.formula?.number || 0}
    Total Investments: R${props["Total Investments"]?.formula?.number || 0}
    Total Income: R${props["Total Income"]?.formula?.number || 0}
    Total Expenses: R${props["Total Expenses"]?.formula?.number || 0}
    Net Monthly Savings: R${props["Net Monthly Savings"]?.formula?.number || 0}
    Progress Percentage: ${props["Progress Percentage"]?.formula?.number || 0}%
    Growth Rate: ${props["Growth Rate"]?.formula?.number || 0}%
`);
        });
        
        return response;
    } catch (error) {
        console.error("Error reading entries:", error);
        throw error;
    }
}

// Automation for status updates based on metrics
async function updateStatusBasedOnMetrics(pageId) {
    const metrics = await getPageMetrics(pageId);
    let newStatus = "On Track";
    
    if (metrics.expenseRatio > 70) {
        newStatus = "At Risk";
    } else if (metrics.monthlyGrowth < 10) {
        newStatus = "Behind";
    }

    await notion.pages.update({
        page_id: pageId,
        properties: {
            "Status": {
                select: {
                    name: newStatus
                }
            }
        }
    });
}

// Add new helper function for metrics
async function getMetrics() {
    const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [{ property: "Name", direction: "descending" }],
        page_size: 1
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const props = page.properties;

    return {
        expenseRatio: props["Expense Ratio"]?.formula?.number || 0,
        monthlyGrowth: props["Monthly Growth Rate"]?.formula?.number || 0,
        investmentROI: props["Investment ROI"]?.formula?.number || 0,
        totalRevenue: props["Total AI Revenue"]?.formula?.number || 0,
        netSavings: props["Net Monthly Savings"]?.formula?.number || 0
    };
}

// Update monthly report generation
async function generateMonthlyReport(month) {
    const metrics = await getMetrics();
    const chartData = await prepareChartData();
    const chartImage = await generateMetricsChart(chartData);

    await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
            Name: {
                title: [{ text: { content: `${month} - Report` } }]
            },
            Tags: {
                multi_select: [{ name: "📊 Report" }]
            }
        },
        children: [
            {
                object: "block",
                type: "heading_1",
                heading_1: {
                    rich_text: [{ text: { content: "Monthly Financial Report" } }]
                }
            },
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            text: {
                                content: `Monthly Growth Rate: ${metrics.monthlyGrowth}%\nExpense Ratio: ${metrics.expenseRatio}%\nInvestment ROI: ${metrics.investmentROI}%`
                            }
                        }
                    ]
                }
            },
            {
                object: "block",
                type: "image",
                image: {
                    type: "external",
                    external: {
                        url: "URL_TO_HOSTED_CHART_IMAGE" // You'll need to host this image somewhere
                    }
                }
            }
        ]
    });
}

// Function to prepare data for charts
async function prepareChartData() {
    const response = await notion.databases.query({
        database_id: DATABASE_ID,
        sorts: [
            {
                property: "Name",
                direction: "ascending"
            }
        ]
    });

    return {
        labels: response.results.map(page => page.properties.Name.title[0].text.content),
        revenue: response.results.map(page => page.properties["Total AI Revenue"].formula.number),
        expenses: response.results.map(page => page.properties["Total Expenses"].formula.number),
        savings: response.results.map(page => page.properties["Net Monthly Savings"].formula.number)
    };
}

export { notion, setup, addMonthlyEntry, readEntries, updateStatusBasedOnMetrics, getMetrics, generateMonthlyReport, prepareChartData }; 