'use strict';
(function () {
  let data = "no data";
  let allYearsData = "no data"; 
  let svgLineGraph = "";
  let defualtValue = "Afghanistan";
  let allCountry = "";


  window.onload = function () {
    svgLineGraph = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);


    d3.csv("./data/wblData.csv")
      .then((csvData) => {
        data = csvData
        allYearsData = csvData;
        makeLineGraph(defualtValue);
      });
    
  }

  function makeLineGraph(country) {
    svgLineGraph.html("");
    allCountry = allYearsData.filter((row) => row["economy"] == country);
    let timeData = allCountry.map((row) => row["reportyr"]);
    let WBLINDEX = allCountry.map((row) => row["WBL INDEX"]);
    let range = findMinMax(timeData, WBLINDEX);
    svgLineGraph.selectAll('g').remove()
    let funcs = drawAxes(range, "reportyr", "WBL INDEX", svgLineGraph, { min: 50, max: 450 }, { min: 50, max: 450 });
    plotLineGraph(funcs, allCountry, country);

    dropdownFunc()
  }

  function dropdownFunc(){
    let filterLoc = [...new Set(allYearsData.map((row) => row["economy"]))];
    //plotAverageLine(WBLINDEX)
    let dropdown = d3.select("body").append("select").on('change', function () {
      var selected = this.value;
      var selectedCountry = allYearsData.filter(country => country["economy"] == selected);
      svgLineGraph.selectAll('g').remove();
      svgLineGraph.selectAll('path').remove();
      svgLineGraph.selectAll('text').remove();
      let range = findMinMax(selectedCountry.map((row) => +row["reportyr"]), selectedCountry.map((row) => +row["WBL INDEX"]));
      let funcs = drawAxes(range, "reportyr", "WBL INDEX", svgLineGraph, { min: 50, max: 450 }, { min: 50, max: 450 });
        plotLineGraph(funcs, selectedCountry, selected);
      });
      dropdown.selectAll("option")
        .data(filterLoc)
        .enter()
        .append("option")
        .text((d) => {
          return d;
        })
        .attr("value", (d) => d)
  }

  function plotAverageLine(WBLINDEX){
    var total = 0;
    for(var i = 0; i < WBLINDEX.length; i++) {
      var num = parseInt(WBLINDEX[i])
      total += num;
    }
    var avg = total / WBLINDEX.length;
    svgLineGraph.append("text")
      .transition()
      .duration(5000)
      .attr("x", 60)
      .attr("y", 50)
      .style("font-size", "12px")  
      .text("Average Btw 2009 and 2018 is " + avg);

  }

  function plotLineGraph(funcs, allCountry, country) {
    let WBLINDEX = allCountry.map((row) => row["WBL INDEX"]);
    plotAverageLine(WBLINDEX)
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    let line = d3.line()
      .x((d) => funcs.x(d))
      .y((d) => funcs.y(d));

    svgLineGraph.append('path')
      .datum(allCountry)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line)
      .on("mouseover", (d) => {
          div.transition()
            .duration(100)
            .style("opacity", .9);
          div.html("Country: " + d[0].economy + "<br/>" + "Country Code: " + d[0].wbcodev2 + "<br/>" + "Region: " + d[0].Region + "<br/>" + "Income Group: " + d[0]["Income group"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", 0);
        })
        

      

    // Animation


      
    svgLineGraph.append('text')
    .transition()
    .duration(5000)
      .attr('x', 230)
      .attr('y', 490)
      .style('font-size', '12pt')
      .text('Year');
    svgLineGraph.append('text')
      .transition()
      .duration(5000)
      .attr('x', 230)
      .attr('y', 30)
      .style('font-size', '12pt')
      .text(country);
    svgLineGraph.append('text')
    .transition()
    .duration(5000)
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '12pt')
      .text('WBL Index');

  }

  function drawAxes(limits, x, y, svg, rangeX, rangeY) {
    let xValue = function (d) { return +d[x]; }
    let xScale = d3.scaleLinear()
      .domain([limits.xMin, limits.xMax]) 
      .range([rangeX.min, rangeX.max]);
    let xMap = function (d) { return xScale(xValue(d)); };
    let xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d"));
    svg.append("g")
      .transition()
      .duration(5000)
      .attr('transform', 'translate(0, ' + rangeY.max + ')')
      .call(xAxis);
    let yValue = function (d) { return +d[y] }
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin]) 
      .range([rangeY.min, rangeY.max]);
    let yMap = function (d) { return yScale(yValue(d)); };
    let yAxis = d3.axisLeft().scale(yScale);
    svg.append('g')
    .transition()
    .duration(5000)
      .attr('transform', 'translate(' + rangeX.min + ', 0)')
      .call(yAxis);
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  function findMinMax(x, y) {
    let xMin = d3.min(x);
    let xMax = d3.max(x);
    let yMin = d3.min(y) - 2;
    let yMax = d3.max(y) + 5;

    return {
      xMin: xMin,
      xMax: xMax,
      yMin: yMin,
      yMax: yMax
    }
  }


})();