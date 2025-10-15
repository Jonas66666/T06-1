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
    const bars = innerChart
        .selectAll("rect")
        .data(bins)
        .join("rect")
            .attr("x", d => xScale(d.x0))
            .attr("y", d => yScale(d.length))
            .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)) // Ensure positive width with gap
            .attr("height", d => innerHeight - yScale(d.length))
            .attr("fill", barColor)
            .attr("class", "bar")
            .attr("data-x0", d => d.x0) // Store bin range for tooltip
            .attr("data-x1", d => d.x1)
            .attr("data-count", d => d.length);

    /*************/
    /* Add axes */
    /************/
    const bottomAxis = d3.axisBottom(xScale);

    // Add the x-axis to the bottom of the chart relative to the inner chart
    const xAxisGroup = innerChart
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`) 
        .call(bottomAxis)
        .classed("x-axis", true);

    // Remove the domain path from x-axis
    xAxisGroup.select(".domain").remove();

    // Add custom x-axis line that only spans the data area
    xAxisGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "#7f8c8d")
        .attr("stroke-width", 1.5)
        .attr("class", "axis-line");

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
    const yAxisGroup = innerChart
        .append("g")
        .call(leftAxis)
        .classed("y-axis", true);

    // Remove the domain path from y-axis
    yAxisGroup.select(".domain").remove();

    // Add custom y-axis line that only spans the data area
    yAxisGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#7f8c8d")
        .attr("stroke-width", 1.5)
        .attr("class", "axis-line");

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

    /*********************/
    /* Add hover effects */
    /*********************/
    
    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    // Add hover events to bars
    bars
        .on("mouseover", function(event, d) {
            // Highlight bar
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#2980b9");
            
            // Show tooltip
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>Energy Range:</strong> ${d.x0} - ${d.x1} kWh/yr<br>
                    <strong>Count:</strong> ${d.length} TVs
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Restore bar color
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", barColor);
            
            // Hide tooltip
            tooltip.style("opacity", 0);
        });
}