const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

async function generateMetricsChart(data) {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });
    
    const configuration = {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: data.revenue,
                    borderColor: 'rgb(75, 192, 192)',
                },
                {
                    label: 'Expenses',
                    data: data.expenses,
                    borderColor: 'rgb(255, 99, 132)',
                }
            ]
        }
    };

    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    return image;
}

module.exports = { generateMetricsChart }; 