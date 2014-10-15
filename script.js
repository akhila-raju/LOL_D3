var w = 750;
var h = 400;

var dataset;

var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var yScale = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("flarlarlar.csv", type, function(error, data) {

	if (error){
		console.log('Error uploading data');
	} else {
		console.log('Data uploaded successfully!');
	}

	data.forEach(function(d){d['kills'] = +d['kills'],
							 d['assists'] = +d['assists'],
							 d['deaths'] = +d['deaths']
							 d['time'] = +d['time'],
							 d['day'] = dayOfWeek(d['time']),
							 console.log(d['day']);
							 d['winner'] = d['winner']=="True"?1:0;});
	var domainByTrait = {},
    	traits = d3.keys(data[0]),
    	n = traits.length;

    traits.forEach(function(trait) {
    	domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
  	});

	dataset = data;

	// var brush = d3.svg.brush()
 //    	.x(xScale)
 //    	.extent([.3, .9])
 //   		.on("brushstart", brushstart)
 //    	.on("brush", brushmove)
 //    	.on("brushend", brushend);

  	xScale.domain(data.map(function(d) { return d['day']; }));
  	yScale.domain([0, 1]);

  	chart.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + height + ")")
      	.call(xAxis);

  	chart.append("g")
      	.attr("class", "y axis")
      	.call(yAxis);

    dayWins = winRate(data, 'day');

  	chart.selectAll(".bar")
      	.data(data)
    	.enter().append("rect")
      	.attr("class", "bar")
      	.attr("x", function(d) { return xScale(d['day']); })
      	.attr("y", function(d) { return yScale(dayWins[d['day']][1]);})
      	.attr("height", function(d) {return height - yScale(dayWins[d['day']][1]);})
      	.attr("width", xScale.rangeBand());
});

function type(d) {
  d.value = +d.value; // coerce to number
  return d;
}

// Backend functions
function winLoss(data, a){
	var reduced = data.map(function(datum){
		return [datum[a], datum['winner']];
	})
	var wins = reduced.filter(function(x){return x[1] == 1}).map(function(x){return x[0]});
	var losses = reduced.filter(function(x){return x[1] == 0}).map(function(x){return x[0]});
	wins.sort(sortNumber);
	losses.sort(sortNumber);
	return [wins, losses];
}

function winRate(data, a){
	var wins = winLoss(data, a)[0];
	var losses = winLoss(data, a)[1];
	var xVals = unique(wins.concat(losses));
	xVals.sort(sortNumber);
	var rates = [];
	for (i = 0; i<xVals.length; i++){
		val = xVals[i]
		w = 0;
		l = 0;
		for (x = 0; x<wins.length; x++){
			if (wins[x] == val){
				w++;
			}
		}
		for (y = 0; y<losses.length; y++){
			if (losses[y] == val){
				l++;
			}
		}
		if (w == 0){
			rates.push([val,0]);
		} else if (l == 0){
			rates.push([val, 1]);
		} else {
			rates.push([val,w/(w+l)]);
		}
	}
	return rates;
}
// Returns a unique set of values
function unique(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

function sortNumber(a, b){
	return a-b;
}

function dayOfWeek(ms){
	a = new Date(ms);
	return a.getDay();
}

// For each match in the dataset, return the attribute you're looking for and whether or not you won.
// Returns two arrays, Wins and Losses


// Visualization 
function begin(){
	
            
    
}
