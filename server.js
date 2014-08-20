// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');    // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');
var yaml       = require('js-yaml');
var fs         = require('fs');
var env        = yaml.safeLoad(fs.readFileSync(__dirname + "/env.yml"));
var http       = require('http');
var swagger    = require('swagger-jack');
var pg         = require('pg');
var connString = env[process.env.NODE_ENV]["database"];
var db         = new pg.Client(connString);



var port = process.env.PORT || 3000;


// CONFIGURATIONS
// =============================================================================

// APPLICATION
process.env.NODE_ENV    = process.env.NODE_ENV || 'development';
process.env.basePath    = env[process.env.NODE_ENV]["base_path"];
process.env.database    = env[process.env.NODE_ENV]["database"];


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// WIP
// require(__dirname + "/app/helpers.js");
// app.use(app.configureSwagger(process.env.NODE_ENV));


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();        // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:3000/v1)

// citySummary
router.get('/year/:year/budget/op/summary.:format', function(req, res) {

  var year = Number(req.params.year) - 2000;

  var statement = "select agency_id, agency_name, value " +
                  "from budgetbuddy.alladopted " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and " +
                  "inc_dec is null and " +
                  "key = 'AMOUNT' " +
                  "order by value DESC ";

  // Serialize the query result.
  db.connect(function(err) {
    if(err) {return console.error('could not connect to postgres', err);}

    db.query(statement,function (err,result) {
      if(err) {return console.error('could not connect to postgres', err);}
      var summary = {};
      console.log(result);
      summary.total = result.rowCount;
      summary.results = result.rows;
      summary.results.map(function(row) {
        row.more = process.env.basePath + '/v1/year/'+ req.params.year +'/budget/op/' + 'agency/' + row.agency_id + '/summary.json';
      })

      db.end();

      // When the serialization is done, return the array as a JSON.
      return res.json(summary);
    })
  });

});


// agencySummary
router.get('/year/:year/budget/op/agency/:agency/summary.:format', function(req, res) {

  var year = Number(req.params.year) - 2000;

  var statement = "select  unit_of_appropriation_name, unit_of_appropriation_id, value " +
                  "from budgetbuddy.alladopted " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and " +
                  "inc_dec is null and " +
                  "agency_id = " + req.params.agency + " and " +
                  "key = 'AMOUNT' " +
                  "group by unit_of_appropriation_name " +
                  "order by value DESC ";

  // Serialize the query result.
  db.connect(function(err) {
    if(err) {return console.error('could not connect to postgres', err);}

    db.query(statement,function (err,result) {

      db.end();

      // When the serialization is done, return the array as a JSON.
      return res.json(result);
    })
  });
});

// uoaSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/summary.:format', function(req, res) {

  var year = Number(req.params.year) - 2000;

  var statement = "select responsibility_center_name, responsibility_center_id, value " +
    "from budgetbuddy.alladopted " + "where " + "budget_period = 'ADOPTED BUDGET FY" + year + "' and " + "inc_dec is null and " + "agency_id = " + req.params.agency + " and " + "unit_of_appropriation_id = " + req.params.unitOfAppropriation + " and " + "key = 'AMOUNT' " + "group by unit_of_appropriation_name " + "order by value DESC ";

  // Serialize the query result.
  db.connect(function(err) {
    if(err) {return console.error('could not connect to postgres', err);}

    db.query(statement,function (err,result) {

      db.end();

      // When the serialization is done, return the array as a JSON.
      return res.json(result);
    })
  });

});



// rcSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/rc/:rc/summary.:format', function(req,res) {});

//ocSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/rc/:rc/bc/:bc/summary.:format', function(req,res) {});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/v1', router);

// START THE SERVER
// =============================================================================

app.listen(port);
console.log('Express server listening on port ' + port);
