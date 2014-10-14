var w = 960;
var h = 500;


var margin = {top: 20, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
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

  	x.domain(data.map(function(d) { return d["time"]; }));
  	y.domain([0, 1]);

  	chart.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + height + ")")
      	.call(xAxis);

  	chart.append("g")
      	.attr("class", "y axis")
      	.call(yAxis);

  	chart.selectAll(".bar")
      	.data(data)
    	.enter().append("rect")
      	.attr("class", "bar")
      	.attr("x", function(d) { return x(d["time"]); })
      	.attr("y", function(d) { return y(d.value); })
      	.attr("height", function(d) { return height - y(d.value); })
      	.attr("width", x.rangeBand());
});

function type(d) {
  d.value = +d.value; // coerce to number
  return d;
}



// Backend functions
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

// For each match in the dataset, return the attribute you're looking for and whether or not you won.
// Returns two arrays, Wins and Losses
function winLoss(a){
	var reduced = dataset.map(function(x){
		return [x[a], x['winner']];
	})
	var wins = reduced.filter(function(x){return x[1] == "True"}).map(function(x){return +x[0]});
	var losses = reduced.filter(function(x){return x[1] == "False"}).map(function(x){return +x[0]});
	wins.sort(sortNumber);
	losses.sort(sortNumber);
	return [wins, losses];
}

function winRate(a){
	var wins = winLoss(a)[0];
	var losses = winLoss(a)[1];
	var xVals = unique(wins.concat(losses));
	console.log(xVals);
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

// Visualization 
function begin(){
	var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
            
    
}
