/*globals require:false, process:false, console:false */

var sqlite3 = require("sqlite3");
var express    = require('express');
var app        = express();


var port = process.env.PORT || 3000; 		// set our port

var db = new sqlite3.Database('../data/processed/all.db');


var router = express.Router();

router.get('/:year/op/summary', function(req, res) {
  var summary = [];
  // BAD BAD BAD, we should use real SQL params.  But this is just a demo.
  var year = Number(req.params.year) - 2000;
  var statement = "select agency_id, agency_name, sum(value) " +
                  "from `all` " +
                  "where " +
                  "budget_period = 'EXECUTIVE BUDGET FY" + year + "' and " +
                  "`inc/dec` is null and " +
                  "key = 'AMOUNT' " +
                  "group by agency_name " +
                  "order by sum(value) DESC ";
  console.log(statement);
  db.serialize(function() {
    db.each(statement, function(err, result) {
      if (err) { console.log(err); }
      summary.push(result);
    }, function(){
      res.json(summary);
    });
  });
});

app.use('/api/v1', router);




app.listen(port);
console.log('Listening on port ' + port);
