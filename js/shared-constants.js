// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800;  // Total width of the chart
const height = 400; // Total height of the chart
const innerWidth = width - margin.left - margin.right; // Width of the chart area
const innerHeight = height - margin.top - margin.bottom; // Height of the chart area

/* Make the colours accessible globally */
const barColor = "#606464";
const bodyBackgroundColor = "#fffaf0";

// set up the scales
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// Make binGenerator globally accessible
let binGenerator;