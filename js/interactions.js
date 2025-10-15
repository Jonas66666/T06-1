// Global variables to track current filters
let currentScreenFilter = "all";
let currentSizeFilter = "all";

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

    // Common screen sizes with 98" as the largest
    const filters_size = [
        { id: "all", label: "All Sizes", isActive: true },
        { id: "24", label: "24\"", isActive: false },
        { id: "32", label: "32\"", isActive: false },
        { id: "55", label: "55\"", isActive: false },
        { id: "65", label: "65\"", isActive: false },
        { id: "98", label: "98\"", isActive: false }
    ];

    // Populate screen type filters
    const screenFilterContainer = d3.select("#filter_screen");
    
    screenFilterContainer
        .selectAll("button")
        .data(filters_screen)
        .join("button")
            .attr("class", d => `filter-btn ${d.isActive ? "active" : ""}`)
            .text(d => d.label)
            .on("click", function(event, d) {
                console.log("Clicked screen filter:", d.label); 

                if (!d.isActive) {
                    // Update screen filter state
                    filters_screen.forEach(filter => {
                        filter.isActive = d.id === filter.id;
                    });

                    // Update the filter buttons
                    d3.selectAll("#filter_screen .filter-btn")
                        .classed("active", filter => filter.id === d.id);

                    currentScreenFilter = d.id;
                    updateHistogram(data);
                }
            });

    // Populate screen size filters
    const sizeFilterContainer = d3.select("#filter_size");
    
    sizeFilterContainer
        .selectAll("button")
        .data(filters_size)
        .join("button")
            .attr("class", d => `filter-btn ${d.isActive ? "active" : ""}`)
            .text(d => d.label)
            .on("click", function(event, d) {
                console.log("Clicked size filter:", d.label); 

                if (!d.isActive) {
                    // Update size filter state
                    filters_size.forEach(filter => {
                        filter.isActive = d.id === filter.id;
                    });

                    // Update the filter buttons
                    d3.selectAll("#filter_size .filter-btn")
                        .classed("active", filter => filter.id === d.id);

                    currentSizeFilter = d.id;
                    updateHistogram(data);
                }
            });
    
    const updateHistogram = (data) => {
    console.log("Updating histogram with filters - Screen:", currentScreenFilter, "Size:", currentSizeFilter);
    
    // Apply both filters
    let filteredData = data.filter(tv => {
        // Screen type filter
        const screenMatch = currentScreenFilter === "all" || tv.screenTech === currentScreenFilter;
        
        // Screen size filter
        let sizeMatch = true;
        if (currentSizeFilter !== "all") {
            const targetSize = parseInt(currentSizeFilter);
            // Allow some tolerance for size matching (within 2 inches)
            sizeMatch = Math.abs(tv.screenSize - targetSize) <= 2;
        }
        
        return screenMatch && sizeMatch;
    });

    console.log("Filtered data count:", filteredData.length);
    console.log("Filtered data:", filteredData);

    // If no data after filtering, show empty chart
    if (filteredData.length === 0) {
        console.log("No data matches the current filters");
        filteredData = [];
    }

    // Create a custom bin generator for small datasets
    let updatedBins;
    if (filteredData.length > 0) {
        const energyValues = filteredData.map(d => d.energyConsumption);
        const minEnergy = d3.min(energyValues);
        const maxEnergy = d3.max(energyValues);
        
        console.log("Energy range:", minEnergy, "-", maxEnergy);
        
        // For single data point or very small range, create meaningful bins
        if (minEnergy === maxEnergy || filteredData.length === 1) {
            // Create a single bin with reasonable width
            const binWidth = Math.max(50, minEnergy * 0.1); // At least 50 kWh width or 10% of value
            updatedBins = [{
                x0: minEnergy - binWidth/2,
                x1: minEnergy + binWidth/2,
                length: filteredData.length
            }];
        } else {
            // Use the global binGenerator for normal cases
            updatedBins = binGenerator(filteredData);
            
            // Ensure bins have reasonable width
            updatedBins = updatedBins.map(bin => {
                if (bin.x0 === bin.x1) {
                    // Fix zero-width bins
                    const center = bin.x0;
                    const binWidth = Math.max(50, center * 0.1);
                    return {
                        ...bin,
                        x0: center - binWidth/2,
                        x1: center + binWidth/2
                    };
                }
                return bin;
            });
        }
    } else {
        updatedBins = [];
    }

    console.log("Updated bins:", updatedBins);
    
    // RECALCULATE X-SCALE DOMAIN based on filtered data
    if (filteredData.length > 0) {
        const minEng = d3.min(updatedBins, d => d.x0);
        const maxEng = d3.max(updatedBins, d => d.x1);
        
        // Ensure minimum domain range for better visualization
        const range = maxEng - minEng;
        const minRange = Math.max(100, minEng * 0.2); // At least 100 kWh range or 20% of min value
        
        if (range < minRange) {
            const center = (minEng + maxEng) / 2;
            xScale.domain([center - minRange/2, center + minRange/2]);
        } else {
            xScale.domain([minEng, maxEng]);
        }
        
        console.log("X-scale domain:", xScale.domain());
    } else {
        // If no data, set a default domain
        xScale.domain([0, 1000]);
    }
    
    // Update y-scale domain
    const updatedBinsMaxLength = filteredData.length > 0 ? d3.max(updatedBins, d => d.length) : 0;
    yScale.domain([0, Math.max(1, updatedBinsMaxLength)]).nice(); // Ensure at least 1 for domain

    // Select the main chart group
    const innerChart = d3.select("#histogram svg g");

    // Update the bars with new x-scale
    const bars = innerChart
        .selectAll("rect")
        .data(updatedBins, d => d.x0 + "-" + d.x1); // Better key for data joining

    // Remove excess bars
    bars.exit()
        .transition()
        .duration(300)
        .attr("width", 0)
        .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
        .remove();

    // Update existing bars with new positions and sizes
    bars.transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => {
            const width = xScale(d.x1) - xScale(d.x0) - 1;
            return Math.max(3, width); // Minimum 3px width for visibility
        })
        .attr("height", d => innerHeight - yScale(d.length))
        .attr("fill", barColor);

    // Add new bars
    bars.enter()
        .append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", innerHeight)
        .attr("width", d => {
            const width = xScale(d.x1) - xScale(d.x0) - 1;
            return Math.max(3, width); // Minimum 3px width for visibility
        })
        .attr("height", 0)
        .attr("fill", barColor)
        .attr("class", "bar")
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("y", d => yScale(d.length))
        .attr("height", d => innerHeight - yScale(d.length));

    // Update the x-axis with new scale
    const xAxisGroup = innerChart.select(".x-axis");
    const bottomAxis = d3.axisBottom(xScale);
    
    xAxisGroup
        .transition()
        .duration(500)
        .call(bottomAxis);

    // Update the y-axis
    innerChart
        .select(".y-axis")
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale));

    // Update custom axis lines to match new scales
    // Update x-axis line
    innerChart.select(".x-axis .axis-line")
        .transition()
        .duration(500)
        .attr("x2", innerWidth);

    // Update hover events for all bars
    innerChart
        .selectAll("rect")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "#6a6767");
            
            // Format the tooltip based on bin width
            let energyRangeText;
            if (d.x1 - d.x0 <= 1) {
                // For very narrow bins, show the center value
                const center = (d.x0 + d.x1) / 2;
                energyRangeText = `Energy: ${center.toFixed(0)} kWh/yr`;
            } else {
                energyRangeText = `Energy Range: ${d.x0.toFixed(0)} - ${d.x1.toFixed(0)} kWh/yr`;
            }
            
            d3.select(".tooltip")
                .style("opacity", 1)
                .html(`
                    <strong>${energyRangeText}</strong><br>
                    <strong>Count:</strong> ${d.length} TV${d.length !== 1 ? 's' : ''}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            d3.select(".tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", barColor);
            d3.select(".tooltip").style("opacity", 0);
        });
};
}