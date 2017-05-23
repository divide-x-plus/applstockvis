/**
 * scrollVis encapsulates all the code for using reusable charts pattern.
 * source: http://bost.ocks.org/mike/chart/
 * @return chart, func that contains all vis elements.
 */
var scrollVis = function() {
  // dimension of the vis area
  var width = 800, height = 520;
  var margin = {top: 0, left: 20, bottom: 40, right: 10};

  // to keep track of which vis to render
  var lastIndex = -1, activeIndex = 0;

  var svg = null, g = null;

  // set the domain for when data are processed
  var x = d3.scaleTime().rangeRound([0, width]);
  var y = d3.scaleLinear().rangeRound([height, 0]);

  // init axes for time series
  var xAxisTime = d3.axisBottom().scale(x)
  .ticks(3)
  .tickSizeInner(10)
  .tickSizeOuter(7);

  var yAxisClose = d3.axisLeft().scale(y)
  .ticks(3, '$,s')
  .tickSizeInner(-10)
  .tickSizeOuter(7);

  // init axes for bar chart
  var xBarScale = d3.scaleBand()
  .domain(rev.map(d=>d.product))
  .rangeRound([0, width]).padding(0.2);

  var yBarScale = d3.scaleLinear()
  .domain([0, 160000])
  .rangeRound([height, 0]);

  var activateFunctions = [], updateFunctions = [];

  /**
   * This function draws the visualization in specified selection.
   * @param {d3.selection} selection current d3.selection()
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      svg = d3.select(this).selectAll('svg').data([stockData]);
      var svgE = svg.enter().append('svg');
      // combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g');

      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      g.append('clipPath')
        .attr('id', 'clip')
      .append('rect')
        .attr('width', width)
        .attr('height', height);

      // perform some preprocessing on raw data
      var stockData = getStock(rawData);

      // set the line chart domains
      x.domain(d3.extent(stockData, function(d) { return d.date; }));
      y.domain(d3.extent(stockData, function(d) { return d.close; })).nice();

      setupVis(stockData);
      setupSections();
    });
  };

  /**
   * Creates initial elements for all sections of the visualization.
   * @param {Array} stockData data object for daily closing price.
   */
  var setupVis = function(stockData) {
    // title
    g.append('text')
      .attr('class', 'title apple-title')
      .attr('x', width / 2)
      .attr('y', height / 3)
      .text('How does the stock market');

    g.append('text')
      .attr('class', 'sub-title apple-title')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text("hype about the iPhone's");

    g.append('text')
      .attr('class', 'title bottomline')
      .attr('x', width / 2)
      .attr('y', (height / 3) + (height / 5))
      .text("How do you think the iPhone will disrupt the markets based off of this historical data?");

    g.selectAll('.apple-title')
      .attr('opacity', 0);

    g.selectAll('.bottomline')
      .style('opacity', 0);

    g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxisTime);

    g.append('g')
      .attr('class', 'y axis')
      .call(yAxisClose)
    .selectAll('text')
      .attr('y', -10)
      .attr('x', 0)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-90)')
      .attr('transform', 'translate(' + margin.left + ',0)')
      .style('text-anchor', 'start');

    // draw bar chart axes
    g.append('g')
      .attr('class', 'x bar axis')
      .attr('transform', 'translate(0, ' + height + ')')
      .call(d3.axisBottom(xBarScale));

    g.append('g')
      .attr('class', 'y bar axis')
      .call(d3.axisLeft(yBarScale).ticks(3, '$,s'))
    .selectAll('text')
      .attr('y', -10)
      .attr('x', 0)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(-90)')
      .attr('transform', 'translate(' + margin.left - 10 + ',0)')
      .style('text-anchor', 'start');

    g.select('.x.axis').style('opacity', 0);
    g.select('.y.axis').style('opacity', 0);
    g.select('.x.bar.axis').style('opacity', 0);
    g.select('.y.bar.axis').style('opacity', 0);

    // init line chart generator
    var line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.close));

    g.datum(stockData).on('click', click);

    g.append('path')
      .attr('class', 'line')
      .attr('clip-path', 'url(#clip)')
      .attr("d", line)
      .attr('transform', 'translate(' + margin.left + ',0)')
      .attr('opacity', 0);

    // generate selected circles
    g.selectAll('.dot')
      .data(stockData)
    .enter().append('circle')
      .filter(function(d) { return d.close === 97.53 || d.close === 112.91 || d.close === 114.09; })
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.close))
      .attr('transform', 'translate(' + margin.left + ',0)')
      .attr('opacity', 0);

    g.selectAll('.dots')
       .data(stockData)
      .enter().append('circle')
        .attr('class', 'dots')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.close))
        .attr('transform', 'translate(' + margin.left  + ',0)')
        .attr('opacity', 0.1);

    g.selectAll('.text')
      .data(stockData)
    .enter().append('text')
      .filter(function(d) { return d.close === 97.53 || d.close === 112.91 || d.close === 114.09; })
      .attr('class', 'annotation text')
      .attr('x', function(d) { return x(d.date) + 10; })
      .attr('y', function(d) { return y(d.close - 10); })
      .text(function(d, i) {
        if (i===0) { return "iPhone 6/6 Plus Release"}
        else if (i===1) { return "iPhone 6S/6S Plus Release"}
        else if (i===2) { return "iPhone 7/7 Plus Release"}
      });

    // code to switch view on time-series data
    function click() {
      var n = stockData.length - 1,
          i = Math.floor(Math.random() * n / 2),
          j = i + Math.floor(Math.random() * n / 2) + 1;
      x.domain([stockData[i].date, stockData[j].date]);
      var t = g.transition().duration(200);
      t.select('.x.axis').call(xAxisTime);
      t.select('.y.axis').call(yAxisClose);
      t.select('.line').attr('d', line);
      t.selectAll('.dots').remove();
    }
  }

  /** Each section is activated by a separate function. */
  var setupSections = function() {
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showLine;
    activateFunctions[2] = showCircles;
    activateFunctions[3] = showBars;
    activateFunctions[4] = showDown;
  }

  /** Shows initial title and hides axis and line chart. */
  function showTitle() {
    g.selectAll('.apple-title')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);

    g.selectAll('.bottomline')
      .transition()
      .duration(600)
      .attr('opacity', 1.0);

    g.selectAll('.line')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.dot')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.text')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.dots')
    .transition()
    .duration(600)
    .attr('opacity', 0.1);

    g.selectAll('.rect')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.text-bar')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    hideAxis();
    g.select('.x.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.select('.y.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.selectAll('.bottomline')
      .transition()
      .duration(600)
      .style('opacity', 0);
  }

  /** Shows axis and hides initial title. */
  function showLine() {
    g.selectAll('.apple-title')
      .transition()
      .duration(0)
      .attr('opacity', 0);

    g.selectAll('.line')
      .transition()
      .duration(600)
      .attr('opacity', 1);

    g.selectAll('.dot')
    .transition()
    .duration(600)
    .attr('opacity', 1);

    g.selectAll('.dots')
    .transition()
    .attr('opacity', 1);

    g.selectAll('.text')
    .transition()
    .duration(600)
    .attr('opacity', 1);

    showXAxis(xAxisTime);
    showYAxis(yAxisClose);

    g.select('.x.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.select('.y.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.selectAll('.bottomline')
      .transition()
      .duration(600)
      .style('opacity', 0);
  }

  /** Shows dates when iPhones are released. */
  function showCircles() {
    g.selectAll('.dot')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.dots')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.text')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.line')
      .transition()
      .duration(600)
      .attr('opacity', 1);

    g.selectAll('.rect')
    .transition()
    .style('opacity', 0);

    g.selectAll('.text-bar')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.select('.x.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.select('.y.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    showXAxis(xAxisTime);
    showYAxis(yAxisClose);

    g.selectAll('.bottomline')
      .transition()
      .duration(600)
      .style('opacity', 0);

  }

  /** Shows bar charts. */
  function showBars() {
    hideAxis();

    g.selectAll('.rect')
    .transition()
    .duration(600)
    .style('opacity', 1);

    render();

    g.select('.x.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 1);

    g.select('.y.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 1);

    g.selectAll('.dot')
    .transition()
    .duration(300)
    .attr('opacity', 0);

    g.selectAll('.line')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.text-bar')
    .transition()
    .duration(600)
    .attr('opacity', 1);

    g.selectAll('.bottomline')
      .transition()
      .duration(600)
      .style('opacity', 0);
  }

  function showDown() {
    hideAxis();

    g.select('.x.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.select('.y.bar.axis')
    .transition()
    .duration(600)
    .style('opacity', 0);

    g.selectAll('.dot')
    .transition()
    .duration(300)
    .attr('opacity', 0);

    g.selectAll('.line')
    .transition()
    .duration(600)
    .attr('opacity', 0);

    g.selectAll('.text-bar')
    .transition()
    .duration(600)
    .attr('opacity', 1);

    g.selectAll('.rect')
    .transition()
    .style('opacity', 0);

    g.selectAll('.bottomline')
      .transition()
      .duration(600)
      .style('opacity', 1.0);
  }

  /**
   * Displays chosen axis.
   * @param axis, the axis to show
   */
  function showXAxis(axis) {
    g.select('.x.axis')
      .call(axis)
      .transition().duration(600)
      .style('opacity', 1);
  }

  function showYAxis(axis) {
    g.select('.y.axis')
      .call(axis)
      .transition().duration(600)
      .style('opacity', 1);
  }

  /** Hides all axes. */
  function hideAxis() {
    g.select('.x.axis')
      .transition().duration(600)
      .style('opacity', 0);

    g.select('.y.axis')
      .transition().duration(600)
      .style('opacity', 0);
  }

  function render (year = '2016') {
    var t = d3.transition().duration(1000);

    var update = g.selectAll('.rect')
        .data(rev.filter(d=>d[year]), d => d.product);

    update.exit()
      .transition(t)
      .attr('y', height)
      .attr('height', 0)
      .remove();

    update
      .transition(t)
      .delay(1000)
      .attr('y', d => yBarScale(d[year]))
      .attr('height', d => height - yBarScale(d[year]));

    update
      .enter()
      .append('rect')
      .attr('class', 'rect')
      .attr('y', height)
      .attr('height', 0)
      .attr('x', d => xBarScale(d.product))
      .attr('width', d => xBarScale.bandwidth())
      .transition(t)
      .attr('y', d => yBarScale(d[year]))
      .attr('height', d => height - yBarScale(d[year]));
  }

  /**
   * Maps raw data to array of data objects.
   * @param rawData, data read in from file
   */
  function getStock(rawData) {
    var parseTime = d3.timeParse("%m/%d/%y");
    return rawData.map(function(d) {
      d.date = parseTime(d.date);
      d.close = +d.close;
      return d;
    });
  }



  /**
   * Activates vis set up within chart func.
   * @param {Number} index index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * Updates vis set up within chart func.
   * @param  {Number} index
   * @param  {Number} progress [0.0, 1.0] denotes how far user has scrolled in section
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  }
  return chart;
};


/**
 * Sets up the scroller and displays the visualization.
 * @param {Array} data loaded array of data objects
 */
function display(data) {
  var plot = scrollVis();

  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller().container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // set up event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });
    // activate current section
    plot.activate(index);
  });
}


/** Apple product revenue */
var rev = [
  {product: 'iPhone', '2014': 101991, '2015': 155041,'2016': 136700},
  {product: 'iPad', '2014': 30283, '2015': 23227,'2016': 20628},
  {product: 'Mac', '2014': 18063, '2015': 25471,'2016': 22831}
];

// load data and display
d3.csv('data.csv', display);
