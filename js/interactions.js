const populateFilters = (data) => {
    /***********************************************/
    /* Make the filter options accessible globally */
    /***********************************************/
    const filters_screen = [
        { id: "all", label: "All", isActive: true },
        { id: "LED", label: "LED", isActive: false },
        { id: "LCD", label: "LCD", isActive: false },
        { id: "OLED", label: "OLED", isActive: false }
    ];

    // Fix: Use the correct ID that matches your HTML
    const filterContainer = d3.select("#filter_screen");
    
    filterContainer
        .selectAll("button")
        .data(filters_screen)
        .join("button")
            .attr("class", d => `filter-btn ${d.isActive ? "active" : ""}`)
            .text(d => d.label)
            .on("click", function(event, d) {
                console.log("Clicked filter:", d.label); 
                console.log("Clicked filter data:", d);

                if (!d.isActive) {
                    // make sure button clicked is not already active
                    filters_screen.forEach(filter => {
                        filter.isActive = d.id === filter.id;
                    });

                    // update the filter buttons based on which one was clicked
                    d3.selectAll("#filter_screen .filter-btn")
                        .classed("active", filter => filter.id === d.id);

                    updateHistogram(d.id, data);
                }
            });
    
    const updateHistogram = (filterId, data) => {
        console.log("Updating histogram with filter:", filterId);
        
        const updatedData = filterId === "all" 
            ? data 
            : data.filter(tv => tv.screenTech === filterId);

        console.log("Filtered data count:", updatedData.length);

        // Regenerate bins with filtered data
        const updatedBins = binGenerator(updatedData);
        
        // Get the maximum length for the new bins to update y-scale domain
        const updatedBinsMaxLength = d3.max(updatedBins, d => d.length);
        yScale.domain([0, updatedBinsMaxLength]).nice();

        // Update the bars
        d3.select("#histogram svg g")
            .selectAll("rect")
            .data(updatedBins)
            .join("rect")
            .transition()
                .duration(500)
                .ease(d3.easeCubicInOut)
                .attr("x", d => xScale(d.x0))
                .attr("y", d => yScale(d.length))
                .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
                .attr("height", d => innerHeight - yScale(d.length))
                .attr("fill", barColor)
                .attr("class", "bar");

        // Update the y-axis
        d3.select("#histogram svg g")
            .select(".y-axis") // We need to add this class to the y-axis group
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));
    };

    // Add class to y-axis for easy selection
    d3.select("#histogram svg g")
        .select("g:last-child") // The y-axis group
        .classed("y-axis", true);
}