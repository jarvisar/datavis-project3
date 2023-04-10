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

    


    vis.updateVis(); //call updateVis() at the end - we aren't using this yet. 
  }
/**
   * Prepare the data and scales before we render it.
   */
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
    .style("stroke", "black")
    .style("fill", "none")
    .style("stroke-width", 1);

    console.log(d3.min(vis.data, d => d.count))
    console.log(d3.max(vis.data, d => d.count))
    vis.scale = d3.scaleLinear()
        .domain([d3.min(vis.data, d => d.count),d3.max(vis.data, d => d.count)])
        .range([30, 80])
    console.log(vis.scale(d3.max(vis.data, d => d.count)))
    //Title
    vis.svg.append("text")
    .attr('class', 'plan')
       .attr('transform', `translate(${vis.width/2.17}, ${vis.config.margin.top -20 })`)
       .text("Word Cloud")
       .style("font-family", "Roboto")
        .style("color", "black")
        .style("font-size", "18px");

    if(vis.data.length > 0){
      //console.log(vis.data.map(function(d) { return {text: d.word, sizezz:vis.scale(d.count), opacity: d.opacity}; }))
      // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
      // Wordcloud features that are different from one word to the other must be here
      vis.layout = d3.layout.cloud()
        .size([vis.width, vis.height])
        .words(vis.data.map(function(d) { return {text: d.word, sizezz:vis.scale(d.count), opacity: d.opacity}; }))
        .padding(20)        //space between words
        .rotate(function() { return (Math.floor(Math.random() * 3 )- 1) * 90;})
        .fontSize(function(d) { return vis.scale(d.sizezz); })      // font size of words
        .on("end", function(words) {
          vis.draw(words);
        });
      vis.layout.start();
    }
    else{
      vis.chart.append("text")
    .attr('class', 'plan')
       .attr('transform', `translate(${vis.width/2}, ${vis.height/2})`)
       .text("Select a Character to View Their Most Common Words")
       .style("font-family", "Roboto")
        .style("color", "black")
         .attr("text-anchor", "middle")
        .style("font-size", "33px");
    }
    
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
        .style("font-family", "Impact")
        .style("opacity", function(d) { return d.opacity; })
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }
}