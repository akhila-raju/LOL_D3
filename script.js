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
    dayWins = winRate(dataset, 'day');
    console.log(dayWins);
    
  	xScale.domain(dayWins.map(function(d) { return d[0]; }));
  	yScale.domain([0, d3.max(dayWins.map(function(d) {return d[1];}))]);


  	chart.append("g")
      	.attr("class", "x axis")
      	.attr("transform", "translate(0," + height + ")")
      	.call(xAxis);

  	chart.append("g")
      	.attr("class", "y axis")
      	.call(yAxis);

  	chart.selectAll("rect")
      	.data(dayWins, function(d) { return(d); })
    	.enter().append("rect")
      	.attr("class", "bar")
      	.attr("x", function(d) { return xScale(d[0]); })
      	.attr("y", function(d) { return yScale(d[1]);})
      	.attr("height", function(d) {return height - yScale(d[1]);})
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

var killRange, deathRange, assistRange;

  $(function() {
    $( "#kills" ).slider({
      range: true,
      min:  0,
      max: 27,
      values: [ 0, 27 ],
      slide: function( event, ui ) {
        $( "#killamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      	filterData("kills", ui.values);
      }
    });
    $( "#killamount" ).val( $( "#kills" ).slider( "values", 0 ) +
      " - " + $( "#kills" ).slider( "values", 1 ) );
  });

  $(function() {
    $( "#deaths" ).slider({
      range: true,
      min:  0,
      max: 13,
      values: [ 0, 13 ],
      slide: function( event, ui ) {
        $( "#deathamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      	filterData("deaths", ui.values);
      }
    });
    $( "#deathamount" ).val( $( "#deaths" ).slider( "values", 0 ) +
      " - " + $( "#deaths" ).slider( "values", 1 ) );
  });

    $(function() {
    $( "#assists" ).slider({
      range: true,
      min:  0,
      max: 33,
      values: [ 0, 33 ],
      slide: function( event, ui ) {
        $( "#assistamount" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      	filterData("assists", ui.values);
      }
    });
    $( "#assistamount" ).val( $( "#assists" ).slider( "values", 0 ) +
      " - " + $( "#assists" ).slider( "values", 1 ) );
  });

var ranges = [[0, 27], [0, 13], [0, 33]];

function filterData(attr, values){
	if (attr == 'kills'){
		ranges[0] = values;
	} else if (attr == 'deaths'){
		ranges[1] = values;
	} else if (attr == 'assists'){
		ranges[2] = values;
	}
	var toVisualize = dataset.filter(function(d) { return isInRange(d)});
	update(toVisualize);
}

function isInRange(datum){
	return datum['kills'] >= ranges[0][0] && datum['kills'] 
			<= ranges[0][1] && datum['deaths'] >= ranges[1][0] 
			&& datum['deaths'] <= ranges[1][1] && datum['assists'] >= ranges[2][0]
			&& datum['assists'] <= ranges[2][1]
}


function update(dataset) {
  dayWins = winRate(dataset, 'day')
  console.log(dayWins);
  yScale.domain([0, d3.max(dayWins.map(function(d) {return d[1];}))]);

	var bar = chart.selectAll("rect")
		.data(dayWins, function(d) { return(d); });

  bar.exit().remove();

	bar.enter().append("rect")
		.attr("class", "bar")
      	.attr("x", function(d) { return xScale(d[0]); })
      	.attr("y", function(d) { return yScale(d[1]);})
      	.attr("height", function(d) {return height - yScale(d[1]);})
      	.attr("width", xScale.rangeBand());

}