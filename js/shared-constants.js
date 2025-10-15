// Set up dimensions and margins
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800;  // Total width of the chart
const height = 400; // Total height of the chart
const innerWidth = width - margin.left - margin.right; // Width of the chart area
const innerHeight = height - margin.top - margin.bottom; // Height of the chart area

/* Make the colours accessible globally */
const barColor = "#606464";
const bodyBackgroundColor = "#fffaf0";

// set up the scales for histogram
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// Make binGenerator globally accessible
let binGenerator;

/*********************************************/
/* Additional constants for scatterplot */
/*********************************************/

// Separate inner chart for scatterplot to avoid conflicts
let innerChartS;

// Separate scales for scatterplot
const xScaleS = d3.scaleLinear();
const yScaleS = d3.scaleLinear();

// Tooltip dimensions
const tooltipWidth = 65;
const tooltipHeight = 32;

// Color scale for screen types
const colorScale = d3.scaleOrdinal()
    .domain(["LED", "LCD", "OLED"])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Blue, Orange, Green

// Alternative color scale (matching your existing theme)
const colorScaleAlt = d3.scaleOrdinal()
    .domain(["LED", "LCD", "OLED"])
    .range(["#3498db", "#e74c3c", "#2ecc71"]); // Blue, Red, Green

// Screen type colors for consistent usage
const screenTypeColors = {
    "LED": "#3498db",
    "LCD": "#e74c3c", 
    "OLED": "#2ecc71"
};