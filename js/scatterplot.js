const drawScatterplot = (data) => {
    // Clear any existing chart
    d3.select("#scatterplot").html("");
    
    // Set the dimension and margins of the chart area
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create an inner chart group with margins
    innerChartS = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up x and y scales using data extents
    const xExtent = d3.extent(data, d => d.star);
    const yExtent = d3.extent(data, d => d.energyConsumption); // Changed to energyConsumption

    // Get unique screen technologies for legend
    const uniqueTechs = Array.from(new Set(data.map(d => d.screenTech)));

    // Set up scales with correct ranges
    xScaleS
        .domain([xExtent[0] - 0.5, xExtent[1] + 0.5])
        .range([0, innerWidth])
        .nice();

    yScaleS
        .domain([yExtent[0] - 50, yExtent[1] + 50]) // Adjusted padding for energy values
        .range([innerHeight, 0])
        .nice();

    // Set color scale domain
    colorScale.domain(uniqueTechs);

    /***********************************/
    /* Draw the circles for scatterplot */
    /***********************************/
    innerChartS.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScaleS(d.star))
        .attr("cy", d => yScaleS(d.energyConsumption)) // Changed to energyConsumption
        .attr("r", 4) 
        .attr("fill", d => colorScale(d.screenTech))
        .attr("opacity", 0.5)
        .attr("class", "scatter-point");

    /*************/
    /* Add axes */
    /************/
    // Add x-axis (Star Rating)
    const bottomAxisS = d3.axisBottom(xScaleS);
    const xAxisGroup = innerChartS.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(bottomAxisS)
        .classed("x-axis", true);

    // Add x-axis line
    xAxisGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "#7f8c8d")
        .attr("stroke-width", 2)
        .attr("class", "axis-line");

    // Add x-axis label
    svg.append("text")
        .text("Star Rating")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("class", "axis-label");

    // Add y-axis (Energy Consumption)
    const leftAxisS = d3.axisLeft(yScaleS);
    const yAxisGroup = innerChartS.append("g")
        .call(leftAxisS)
        .classed("y-axis", true);

    // Add y-axis line
    yAxisGroup
        .append("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#7f8c8d")
        .attr("stroke-width", 2)
        .attr("class", "axis-line");

    // Add y-axis label (Energy Consumption)
    svg.append("text")
        .text("Energy Consumption (kWh/yr)")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("class", "axis-label");

    // Add chart title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", 20)
        .text("Energy Consumption vs Star Rating"); // Updated title

    /*********************/
    /* Add legend */
    /*********************/
    const legend = svg.append("g")
        .attr('class', 'legend')
        .attr("transform", `translate(${width - 140}, ${margin.top})`); 
        
    uniqueTechs.forEach((tech, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 22})`);
        g.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', colorScale(tech));
        g.append('text')
            .attr('x', 18)
            .attr('y', 10)
            .text(tech)
            .attr('class', 'axis-label')
            .style('font-size', '12px');
    });

    /*********************/
    /* Add hover effects */
    /*********************/
    
    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip scatter-tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none");

    // Add hover events to circles
    innerChartS.selectAll("circle")
        .on("mouseover", function(event, d) {
            // Highlight circle
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 6)
                .attr("opacity", 0.8);

            // Show tooltip
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>${d.brand} ${d.model}</strong><br>
                    <strong>Screen:</strong> ${d.screenSize}" ${d.screenTech}<br>
                    <strong>Star Rating:</strong> ${d.star}<br>
                    <strong>Energy:</strong> ${d.energyConsumption} kWh/yr
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
            // Restore circle appearance
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", 4)
                .attr("opacity", 0.5);

            // Hide tooltip
            tooltip.style("opacity", 0);
        });
}