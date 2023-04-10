class WordCloud {
  constructor(_config, _data,_refresh) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 50, bottom: 10, right: 50, left: 60 },
    }
    this.data = _data; 
    this.refresh = _refresh
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.width = vis.config.containerWidth;
    vis.height = vis.config.containerHeight - vis.config.margin.bottom - vis.config.margin.top;
    
    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(0,${vis.config.margin.top})`);

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.opacity = 100;
    vis.svg.selectAll('.plan').remove();

    vis.chart = vis.svg.append('g')
      .attr('class', 'plan')
      .attr('transform', `translate(0,${vis.config.margin.top})`);

    vis.chart.append("rect")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .style("stroke", "#444444")
      .style("fill", "none")
      .style("stroke-width", 1)
      .attr("rx", 10) // horizontal radius
      .attr("ry", 10) // vertical radius

    vis.scale = d3.scaleLinear()
      .domain([d3.min(vis.data, d => d.count),d3.max(vis.data, d => d.count)])
      .range([20, 80])

    //Title
    vis.svg.append("text")
    .attr('class', 'plan')
       .attr('transform', `translate(${vis.width/2.17}, ${vis.config.margin.top -20 })`)
        .attr("text-anchor", "middle")
       .text("Word Cloud")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "18px");

        vis.layout = d3.layout.cloud()
        .size([vis.width, vis.height])
        .words(vis.data.map(function(d) { return {text: d.word, sizezz:vis.scale(d.count), opacity: d.opacity}; }))
        .padding(10)        //space between words
        .rotate(function() { return (Math.floor(Math.random() * 3 )- 1) * 90;})
        .fontSize(function(d) { return d.sizezz; })
        .on("end", function(words) {
          vis.draw(words);
        });
      

    vis.layout.start();
  }

  draw(words) {
    let vis = this;
    vis.opacity = vis.opacity - 1;
  vis.chart
    .append("g")
      .attr("transform", "translate(" + vis.layout.size()[0] / 2 + "," + vis.layout.size()[1] / 2 + ")")
      .selectAll("text")
        .data(words)
      .join("text")
        .style("font-size", function(d) { return d.sizezz; })
        .style("fill", "#5fc0ff")
        .attr("text-anchor", "middle")
        .style("font-family", "Roboto")
        .style("opacity", function(d) { return d.opacity; })
        .style('user-select', 'none')
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .on("mouseover", function(d) {
          
          d3.select(this)
          .transition()
          .duration(150)
          .style("fill", "#0079c7");
        })
        .on("mouseout", function(d) {
          d3.select(this)
          .transition()
          .duration(150)
          .style("fill", "#5fc0ff");
        })
        .on("click", function(d) {
          let wordObject = d3.select(this)
          let word = wordObject._groups[0][0].innerHTML
          //vis.refresh(word)
        });
  }
}