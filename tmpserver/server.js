
var sqlite3 = require("sqlite3");
var express    = require('express');
var app        = express(); 


var port = process.env.PORT || 3000; 		// set our port

var db = new sqlite3.Database('../data/2015.db');


var router = express.Router();

router.get('/:year/op/summary', function(req, res) {
	var summary = [];
	var statement = "select agency_id,agency_name, sum(value) from `2015` where budget_period = 'EXECUTIVE BUDGET FY15' and `inc/dec` is null and key = 'AMOUNT' group by agency_name order by sum(value) DESC ";
	db.serialize(function() {
		db.each(statement, function(err, result) {
			summary.push(result);
		}, function(){
			res.json(summary);
		});
	});
    	
	
});

app.use('/api/v1', router);




app.listen(port);
console.log('Listening on port ' + port);
