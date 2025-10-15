const drawHistogram = (data) => {
    // Clear any existing chart
    d3.select("#histogram").html("");
    
    // Set the dimensions and margins of the chart area
    const svg = d3.select("#histogram")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create an inner chart group with margins
    const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a bin generator using d3.bin and make it global
    binGenerator = d3.bin()
        .value(d => d.energyConsumption); // Accessor for energyConsumption

    /**********************/
    /* Generate the bins */
    /*********************/
    const bins = binGenerator(data); //save the bins into an array

    console.log("Bins:", bins); // Log the bins to the console for debugging

    const minEng = bins[0].x0; // lower bound of the first bin
    const maxEng = bins[bins.length - 1].x1; // upper bound of the last bin
    const binsMaxLength = d3.max(bins, d => d.length); // Get the maximum length of the bins

    /******************************************/
    /* Define scales (from shared constants) */
    /*****************************************/
    xScale
        .domain([minEng, maxEng]) 
        .range([0, innerWidth]);

    yScale
        .domain([0, binsMaxLength])
        .range([innerHeight, 0])
        .nice(); // Use the nice() method to round the y-axis values

    /***********************************/
    /* Draw the bars of the histogram */
    /**********************************/
    innerChart
        .selectAll("rect")
        .data(bins)
        .join("rect")
            .attr("x", d => xScale(d.x0))
            .attr("y", d => yScale(d.length))
            .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)) // Ensure positive width with gap
            .attr("height", d => innerHeight - yScale(d.length))
            .attr("fill", barColor)
            .attr("class", "bar");

    /*************/
    /* Add axes */
    /************/
    const bottomAxis = d3.axisBottom(xScale);

    // Add the x-axis to the bottom of the chart relative to the inner chart
    innerChart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`) 
        .call(bottomAxis);

    // Add the x-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .text("Energy Consumption (kWh/yr)");

    const leftAxis = d3.axisLeft(yScale);

    // Add the y-axis to the left of the chart relative to the inner chart
    innerChart
        .append("g")
        .call(leftAxis);

    // Add the y-axis label
    svg
        .append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .text("Frequency");

    // Add chart title
    svg
        .append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", 20)
        .text("TV Energy Consumption Distribution");
}