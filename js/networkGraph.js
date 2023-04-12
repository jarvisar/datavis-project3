class Network {
  constructor(_config, _data,_matrix,_refresh) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 50, bottom: 10, right: 50, left: 60 },
    }
    this.data = _data; 
    this.matrix = _matrix; 
    this.refresh = _refresh
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth;
    vis.height = vis.config.containerHeight - vis.config.margin.bottom - vis.config.margin.top;
    console.log(vis.height)
    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(0,${vis.config.margin.top})`);
    vis.innerRadius = vis.height/2 - 20
    vis.outerRadius = vis.innerRadius + 10
    vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.svg.selectAll('.plan').remove();

    vis.chart = vis.svg.append('g')
      .attr('class', 'plan')
      .attr('transform', `translate(0,${vis.config.margin.top})`);

    vis.title = vis.svg.append("text")
      .attr('class', 'plan')
         .attr('transform', `translate(${vis.width/2.0}, ${vis.config.margin.top -20 })`)
          .attr("text-anchor", "middle")
         .text("Most Frequent Character Interactions")
         .style("font-family", "Roboto")
          .style("color", "black")
          .style("font-size", "18px");
    // 4 groups, so create a vector of 4 colors
    var colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"]

    // give this matrix .to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (vis.matrix)

    // add the groups on the outer part of the circle
    vis.chart
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function(d) { return d.groups; })
      .enter()
      .append("g")
      .append("path")
        .style("fill", function(d,i){ return colors[i] })
        .style("stroke", "black")
        // stroke width
        .style("stroke-width", "0.5px")
        .style("fill-opacity", ".7")
        .attr('transform', `translate(${vis.width / 2},${vis.height / 2})`)
        .attr("d", d3.arc()
          .innerRadius(vis.innerRadius)
          .outerRadius(vis.outerRadius)
        )
      .on("mouseover", function(d) {
        
          let object = d3.select(this)
          let index = object._groups[0][0].__data__.index
          vis.data[index].from
          d3.select('#tooltip')
          .attr('data-value',d.id)
          .style('display', 'block')
          .style('left', event.pageX + 10 + 'px')   
          .style('top', event.pageY + 'px')
          .style("fill-opacity", ".7")
          .html(`
            <div style="text-align: center"><b>${vis.data[index][0].from}</b></div>
          `);
          d3.select(this)
          .transition()
          .duration(150)
          .style("fill-opacity", "1")
        })
        .on("mouseout", function(d) {
          d3.select('#tooltip').style('display', 'none');
          d3.select(this)
          .transition()
          .duration(150)
          .style("fill-opacity", ".7");
        })

    // Add the links between groups
    vis.chart
      .datum(res)
      .append("g")
      .selectAll("path")
      .data(function(d) { return d; })
      .enter()
      .append("path")
        .attr('transform', `translate(${vis.width / 2},${vis.height / 2})`)
        .attr("d", d3.ribbon()
          .radius(vis.innerRadius)
        )
        .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("stroke", "black")
        .style("stroke-width", "0.5px")
        .style("fill-opacity", ".7")
        .on("mouseover", function(d) {
        
          let object = d3.select(this)
          let indexFrom = object._groups[0][0].__data__.source.index
          let indexTo = object._groups[0][0].__data__.target.index
          let lines = object._groups[0][0].__data__.source.value
          d3.select('#tooltip')
          .attr('data-value',d.id)
          .style('display', 'block')
          .style('left', event.pageX + 10 + 'px')   
          .style('top', event.pageY + 'px')
          .html(`
            <div style="text-align: center"><b>${vis.data[indexFrom][0].from} speaking to ${vis.data[indexTo][0].from}</b></div>
            <div style="text-align: center">Lines: ${lines}</b></div>
          `);
          d3.select(this)
          .transition()
          .duration(150)
          .style("fill-opacity", "1");
        })
        .on("mouseout", function(d) {
          d3.select('#tooltip').style('display', 'none');
          d3.select(this)
          .transition()
          .duration(150)
          .style("fill-opacity", ".7");
        })

    
  }

}