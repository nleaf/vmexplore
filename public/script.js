function toggleFooterVisibility(show) {
    const footer = document.getElementById('footer');
    if (show) {
        footer.style.display = 'block';
    } else {
        footer.style.display = 'none';
    }
}
async function fetchResults() {
    try {
        const response = await fetch('/api/results');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching results:', error);
    }
}

async function updateCharts(charts) {
    const results = await fetchResults();
    const data = [results.hypervisor, results.vmware, results.hyperscaler];
    const maxValue = Math.max(...data); // Find the maximum value
    charts.forEach(chart => {
        chart.data.datasets[0].data = data;
        chart.data.datasets[0].datalabels = data.map(value => ({
            opacity: value === maxValue ? 1 : 0.5 // Full opacity for the largest slice, reduced for others
        }));
        chart.update();
    });
}

function createChart(ctx, selectedOption) {
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Alternate Hypervisor', 'VMware Cloud Foundation', 'Hyperscale Cloud'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#FF0000', // Red for Alternate Hypervisor
                    '#000000', // Black for VMware Cloud Foundation
                    '#808080'  // Grey for Hyperscale Cloud
                ],
                borderColor: [
                    '#FF0000',
                    '#000000',
                    '#808080'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true,
                animateRotate: true
            },
            plugins: {
                legend: {
                    display: false // Hide the chart label
                },
                datalabels: {
                    color: '#fff',
                    font: context => {
                        const label = context.chart.data.labels[context.dataIndex];
                        const isSelected = label === selectedOption;
                        return {
                            weight: 'bold',
                            size: isSelected ? 40 : 32, // Larger font size for the selected option value
                            family: "'Inter', 'Helvetica', 'Arial', sans-serif"
                        };
                    },
                    formatter: (value, context) => {
                        return value;
                    },
                    anchor: 'end',
                    align: 'start',
                    offset: 0,
                    opacity: context => {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label === selectedOption ? 1 : 0.8; // Full opacity for the selected option, reduced for others
                    }
                }
            },
            layout: {
                padding: {
                    bottom: 40
                }
            }
        },
        plugins: [{
            id: 'datalabels_labels',
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                chart.data.datasets.forEach(function(dataset, datasetIndex) {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    if (!meta.hidden) {
                        const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
                        meta.data.forEach(function(element, index) {
                            const dataValue = dataset.data[index];
                            const dataLabel = chart.data.labels[index];
                            const isSelected = dataLabel === selectedOption;
        
                            const fontSizeValue = isSelected ? 80 : 32;
                            const fontSizeLabel = isSelected ? 24 : 18;
                            const opacity = dataLabel === selectedOption ? 1 : 0.8;
        
                            const percentage = Math.round((dataValue / total) * 100); // Calculate percentage and round to whole number
                            
                            const model = element.tooltipPosition();
                            const x = model.x;
                            const y = model.y;
        
                            const lineHeight = isSelected ? 30 : 10; // Adjust line height for selected value
        
                            ctx.save();
                            // Draw percentage text
                            ctx.font = Chart.helpers.fontString(fontSizeValue, 'bold', Chart.defaults.font.family);
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                            ctx.fillText(`${percentage}%`, x, y - (fontSizeLabel / 2) - lineHeight); // Draw percentage higher
        
                            // Draw label text
                            const label = dataLabel.split(' '); // Split label into words
                            ctx.font = Chart.helpers.fontString(fontSizeLabel, 'bold', Chart.defaults.font.family);
                            ctx.fillText(label[0], x, y + (fontSizeLabel / 2)); // Draw first part of label
                            ctx.fillText(label.slice(1).join(' '), x, y + (fontSizeLabel * 1.5)); // Draw second part of label below
        
                            ctx.restore();
                        });
                    }
                });
            }
        }]
        
        
        // plugins: [{
        //     id: 'datalabels_labels',
        //     afterDatasetsDraw: function(chart) {
        //         const ctx = chart.ctx;
        //         chart.data.datasets.forEach(function(dataset, datasetIndex) {
        //             const meta = chart.getDatasetMeta(datasetIndex);
        //             if (!meta.hidden) {
        //                 const total = dataset.data.reduce((acc, curr) => acc + curr, 0);
        //                 meta.data.forEach(function(element, index) {
        //                     const dataValue = dataset.data[index];
        //                     const dataLabel = chart.data.labels[index];
        //                     const isSelected = dataLabel === selectedOption;

        //                     const fontSizeValue = isSelected ? 40 : 32;
        //                     const fontSizeLabel = isSelected ? 20 : 16;
        //                     const opacity = dataLabel === selectedOption ? 1 : 0.5;

        //                     const percentage = Math.round((dataValue / total) * 100); // Calculate percentage and round to whole number

        //                     const model = element.tooltipPosition();
        //                     const x = model.x;
        //                     const y = model.y;

        //                     ctx.save();
        //                     ctx.font = Chart.helpers.fontString(fontSizeValue, 'bold', Chart.defaults.font.family);
        //                     ctx.textAlign = 'center';
        //                     ctx.textBaseline = 'middle';
        //                     ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        //                     ctx.fillText(`${percentage}%`, x, y - (fontSizeLabel + 10)); // Move percentage higher
                            
        //                     const label = dataLabel.split(' '); // Split label into words
        //                     ctx.font = Chart.helpers.fontString(fontSizeLabel, 'normal', Chart.defaults.font.family);
        //                     ctx.fillText(label[0], x, y); // Draw first part of label
        //                     ctx.fillText(label.slice(1).join(' '), x, y + (fontSizeLabel + 10)); // Draw second part of label below
                            
        //                     ctx.restore();
        //                 });
        //             }
        //         });
        //     }
        // }]
    });
}


function navigateTo(screenId, selectedOption) {
    console.log(`Navigating to: ${screenId}`);
    const screen = document.getElementById(screenId);
    if (!screen) {
        console.error(`No element found with ID: ${screenId}`);
        return;
    }
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('visible');
    });
    screen.classList.remove('hidden');
    screen.classList.add('visible');
    toggleFooterVisibility(screenId !== 'home'); // Show footer on all screens except home
    updateChartsAndRecreate(screenId, selectedOption); // Update and recreate chart when navigating
}

async function updateChartsAndRecreate(screenId, selectedOption) {
    const results = await fetchResults();
    const data = [results.hypervisor, results.vmware, results.hyperscaler];

    const chartIdMap = {
        screenvmware: 'chart-vmware',
        screenhypervisor: 'chart-hypervisor',
        screenhyperscaler: 'chart-hyperscaler'
    };

    const canvasId = chartIdMap[screenId];
    if (canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const newChart = createChart(ctx, selectedOption);
        newChart.data.datasets[0].data = data;
        newChart.update();
    }
}

async function handleSelection(selection) {
    await recordSelection(selection);
    const selectedLabelMap = {
        vmware: 'VMware Cloud Foundation',
        hypervisor: 'Alternate Hypervisor',
        hyperscaler: 'Hyperscale Cloud'
    };
    navigateTo(`screen${selection}`, selectedLabelMap[selection]);
}


async function recordSelection(selection) {
    try {
        const response = await fetch('/api/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selection })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error recording selection:', error);
    }
}

// Initialize home screen visibility and load selections
document.getElementById('home').classList.add('visible');
toggleFooterVisibility(false); // Hide footer initially

document.getElementById('expertForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    alert(`Form submitted with email: ${email}`);
    // Here you can handle the form submission, e.g., sending data to the server
    navigateTo('home'); // Navigate back to home after submission
});

// Add event listener to footer to navigate to home
document.getElementById('footer').addEventListener('click', function() {
    navigateTo('home');
});