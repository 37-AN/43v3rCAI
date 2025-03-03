const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Schedule daily metrics check
cron.schedule('0 9 * * *', async () => {
    const metrics = await getMetrics();
    
    // Check for concerning metrics
    if (metrics.expenseRatio > 70 || metrics.monthlyGrowth < 10) {
        await sendAlert(metrics);
    }
});

// Schedule monthly report generation
cron.schedule('0 0 1 * *', async () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthStr = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    await generateMonthlyReport(monthStr);
});

async function sendAlert(metrics) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL,
        subject: '⚠️ Financial Metrics Alert',
        html: `
            <h2>Financial Metrics Alert</h2>
            <p>The following metrics require attention:</p>
            <ul>
                <li>Expense Ratio: ${metrics.expenseRatio}%</li>
                <li>Monthly Growth: ${metrics.monthlyGrowth}%</li>
                <li>Investment ROI: ${metrics.investmentROI}%</li>
            </ul>
        `
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendAlert }; 