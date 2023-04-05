class CharacterBrush {
  constructor(_config, _data,_refresh) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 40, bottom: 40, right: 50, left: 60 },
      contextWidth: 40,
      contextMargin: 20
    }
    this.data = _data; 
    this.refresh = _refresh
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right - vis.config.margin.left + vis.config.contextMargin;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);
    //Title
    vis.svg.append("text")
       .attr('transform', `translate(${vis.width/2.17}, ${vis.config.margin.top -20 })`)
       .text("Lines Spoken By Characters")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "18px");

    // X axis Label    
    vis.svg.append("text")
       .attr("transform", `translate(${vis.width/1.8 + vis.config.margin.left},${vis.height + vis.config.margin.bottom + 35})`)
       .style("text-anchor", "middle")
       .text("Number of Lines Spoken")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "14px")

    // Y axis Label    
    vis.svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("x", -(vis.height/2) - vis.config.margin.top)
       .attr("y", 35)
       .style("text-anchor", "middle")
       .text("Character Name")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "14px");
    vis.yAxisLine = vis.svg.append("line")
        .attr("x1", vis.config.contextWidth + vis.config.contextMargin -1)
        .attr("y1", vis.config.margin.top )
        .attr("x2", vis.config.contextWidth + vis.config.contextMargin -1)
        .attr("y2", vis.height + vis.config.margin.top)
        .attr("stroke", "black")
        .attr("stroke-width", 1);
    vis.static = true;
    vis.updateVis(); //call updateVis() at the end - we aren't using this yet. 
  }
/**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    vis.svg.selectAll('.y-axis').remove();
    vis.svg.selectAll('.x-axis').remove();
    vis.svg.selectAll('.chart').remove();
    vis.svg.selectAll('.plan').remove();
    vis.svg.selectAll('.no-data-text').remove();
    
    
    vis.yScale = d3.scaleBand()
        .domain(vis.data.map(function(d) { return d.name; }))
        .range([vis.height, 0])
        .padding(0.4);
    var max = d3.max( vis.data, d => d.lines)
    var clearLabel = false
    if(max ==0){
        //do this so it looks good when there is no data
        max = 1;
        clearLabel = true

         // Add text in the center of the chart if there is no data
            vis.chart.append('text')
              .attr('class', 'no-data-text')
              .attr('transform', `translate(${vis.width / 2}, ${vis.height / 2})`)
              .attr('text-anchor', 'middle')
              .text('No Data to Display')
              .style("font-family", "Roboto")
                .style("color", "black")
                .style("font-size", "14px");
    }
    vis.xScale = d3.scaleLinear()
        .domain([0, max])
        .range([0, vis.width])
        .nice();
    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(0)
        .tickSizeOuter(0)
        .tickPadding(10)

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSizeOuter(0)
        .tickPadding(10)

    // X axis: scale and draw:
    vis.xContext = d3.scaleLinear()
      .range([0, vis.config.contextWidth])
      .domain([0, max]);   
    vis.yContext = d3.scaleBand()
        .domain(vis.data.map(function(d) { return d.name; }))
        .range([vis.height, 0])
        .padding(0.4);

    vis.contextRects = vis.svg.append('g').attr('class', 'rects');
  

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left + vis.config.contextMargin + vis.config.contextWidth},${vis.config.margin.top})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');


    vis.svg.append('defs').append('clipPath')
        .attr('id', 'clipHist')
        .attr('class', 'chart')
        .append('rect')
        .attr('x',  vis.config.contextWidth + vis.config.contextMargin)
        .attr('y',  vis.config.margin.top)
        .attr('width', vis.width- vis.config.contextWidth + vis.config.contextMargin)
        .attr('height', vis.height)

    vis.contextRects.selectAll('rect')
      .data(vis.data)
      .join('rect')
      .attr('class', 'plan')
      .attr('data',(d) => d.name)
      .style("fill", "#d2d2d2")
      .style("border-left","none")
      .attr('y', (d) => {
        return vis.config.margin.top + vis.yContext(d.name)}) 
      .attr('height', vis.yContext.bandwidth())
      .attr('x', vis.config.contextMargin + vis.config.contextWidth)
      .attr('width', (d) => vis.xContext(d.lines));


    /*vis.brushG = vis.chart.append("g")
      .attr("class", "brush")
      .call(vis.brush);*/
    
    vis.rects = vis.chart.selectAll('rect')
      .data(vis.data)
      .join('rect')
      .attr('class', 'plan')
      .attr('data',(d) => d.name)
      .attr('fill', "#06D6A0")
      .attr("stroke", "#04956f")
      .style("border-left","none")
      .attr('y', (d) => {
        return vis.yScale(d.name)}) 
      .attr('id', (d) => {
        return "byDisc" + d.name.replace(/\s/g, '').replace(/[^a-zA-Z]/g, '')})  
      .attr('height', vis.yScale.bandwidth())
      .attr('x', 1)
      .attr('width', 0)

    vis.rects
          .on('mouseover', (event,d) => {
        d3.select("#byDisc" + d.name.replace(/\s/g, '').replace(/[^a-zA-Z]/g, ''))
            .style("filter", "brightness(70%)");
          d3.select('#tooltip')
            .attr('data-value',d.name)
            .style('display', 'block')
            .style('left', event.pageX + 10 + 'px')   
            .style('top', event.pageY + 'px')
            .html(`
              <div class="tooltip-title" style="font-weight: 600;">Name: ${d.name}</div>
              <div >Calls: ${d.lines}</div>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
          d3.selectAll("rect")
            .style("filter", "brightness(100%)");
        });

    if(!clearLabel){

        // y axis
        vis.label = vis.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${vis.config.margin.left + vis.config.contextMargin + vis.config.contextWidth},${vis.config.margin.top})`)
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text")
            .style("text-anchor", "start")
            .style("word-wrap", "break-word")
            .style("font-family", "Roboto")
            .style("color", "black")
            .style("font-size", "11px")
            .attr("dx", "1.2em")
            .attr("dy", ".4em")

        vis.label
              .on('mouseover', (event,d) => {
            d3.select("#byDisc" + d.replace(/\s/g, '').replace(/[^a-zA-Z]/g, ''))
                .style("filter", "brightness(70%)");
              d3.select('#tooltip')
                .style('display', 'block')
                .style('left', event.pageX + 10 + 'px')   
                .style('top', event.pageY + 'px')
                .style('opacity', 1)
                .attr('data-value',d)
                .html(`
                  <div class="tooltip-title" style="font-weight: 600;">Name: ${d}</div>
                  <div >Calls: ${vis.data.filter(data => data.name === d)[0].lines}</div>
                `);
            })
            .on('mouseleave', () => {
              d3.select('#tooltip').style('display', 'none');
              d3.selectAll("rect")
                .style("filter", "brightness(100%)");
            })
    }
    else{
        vis.label = vis.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`)
            .call(d3.axisLeft(vis.yScale))
            .selectAll("text")
            .style("color", "white")
            .style("font-size", "1px")
            .attr("dx", "-100.2em")
    }


    // Add the x axisS
    vis.chart.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${0}, ${ vis.height})`)
        .call(d3.axisBottom(vis.xScale))
        .append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 6)
         .attr("dy", "-4.1em")
         .attr("text-anchor", "end")
         .attr("stroke", "black")

    vis.rects.on('click', (event, d) => {
        d3.select('#tooltip').style('display', 'none')
        vis.refresh(d3.select('#tooltip')._groups[0][0].dataset.value);
      })
    vis.label.on('click', (event, d) => {
        d3.select('#tooltip').style('display', 'none')
        vis.refresh(d3.select('#tooltip')._groups[0][0].dataset.value);
      })
    vis.rects.transition()
        .duration(1000)
        .attr('width', (d) => vis.xScale(d.lines));
    
  }
  brushed(selection) {
      if (selection === null) {
        // If the selection is null, remove any previous filter
        vis.rects.attr("opacity", 1);
      } else {
        // Otherwise, apply a filter to the data
        var y0 = vis.yScale.invert(selection[0]);
        var y1 = vis.yScale.invert(selection[1]);
        vis.rects.attr("opacity", function(d) {
          return (d.name >= y0 && d.name <= y1) ? 1 : 0.2;
        });
      }
    }
}