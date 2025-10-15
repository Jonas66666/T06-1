// Load the CSV file with a row conversion function
d3.csv("data/Ex6_TVdata.csv", d => ({
    brand: d.brand,
    model: d.model,
    screenSize: +d.screenSize, // Convert Screensize to a number
    screenTech: d.screenTech,
    energyConsumption: +d.energyConsumption, // Convert Energy Consumption to a number
    star: +d.star // Convert star rating to a number
})).then(data => {
    // Filter out any rows with invalid energy consumption
    const validData = data.filter(d => !isNaN(d.energyConsumption) && d.energyConsumption !== null);
    
    // Log the loaded data to the console for verification
    console.log("Loaded data:", validData);

    // Call the function to create the visualizations with the loaded data
    drawHistogram(validData);
    drawScatterplot(validData);
    populateFilters(validData);
}).catch(error => {
    console.error('Error loading the CSV file:', error);
});