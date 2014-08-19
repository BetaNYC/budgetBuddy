// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');    // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');
var sqlite3    = require("sqlite3").verbose();
var env        = require(__dirname + "/env.json");
var fs         = require('fs');
var http       = require('http');
var swagger    = require('swagger-jack');
var yaml       = require('js-yaml');



var port = process.env.PORT || 3000;


// CONFIGURATIONS
// =============================================================================

// APPLICATION
app.currentEnv  = process.env.NODE_ENV || 'development';
app.basePath    = env[app.currentEnv]["base_path"];
app.dbPath      = env[app.currentEnv]["db_path"];


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// WIP
// require(__dirname + "/app/helpers.js");
// app.use(app.configureSwagger(app.currentEnv));


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();        // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:3000/v1)

// citySummary
router.get('/year/:year/budget/op/summary.:format', function(req, res) {

  var db = new sqlite3.Database(__dirname + "/" + app.dbPath);
  var year = Number(req.params.year) - 2000;

  var statement = "select agency_id, agency_name, sum(value) " +
                  "from `alladopted` " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and " +
                  "`inc/dec` is null and " +
                  "key = 'AMOUNT' " +
                  "group by agency_name " +
                  "order by sum(value) DESC ";

  // Serialize the query result.
  var summary = [];
  db.serialize(function() {
    db.each(statement, function(err, result) {
      if (err) { console.log(err); }
      result.more = app.basePath + '/v1/year/'+ req.params.year +'/budget/op/' + result.agency_id + '/summary.json'
      summary.push(result);
    }, function(){
      // When the serialization is done, return the array as a JSON.
      return res.json(summary);
    })
  });
});


// agencySummary
router.get('/year/:year/budget/op/agency/:agency/summary.:format', function(req, res) {

  var db = new sqlite3.Database(__dirname + "/" + app.dbPath);
  var year = Number(req.params.year) - 2000;

  var statement = "select  unit_of_appropriation_name, unit_of_appropriation_id, sum(value) " +
                  "from `alladopted` " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and " +
                  "`inc/dec` is null and " +
                  "agency_id = " + req.params.agency + " and " +
                  "key = 'AMOUNT' " +
                  "group by unit_of_appropriation_name " +
                  "order by sum(value) DESC ";

  // Serialize the query result.
  var summary = [];
  db.serialize(function() {
    db.each(statement, function(err, result) {
      if (err) { console.log(err); }
      summary.push(result);
    }, function(){
      // When the serialization is done, return the array as a JSON.
      return res.json(summary);
    })
  });
});

// uoaSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/summary.:format', function(req, res) {

  var db = new sqlite3.Database(__dirname + "/" + app.dbPath);
  var year = Number(req.params.year) - 2000;

  var statement = "select  responsibility_center_name, responsibility_center_id, sum(value) " +
    "from `alladopted` " + "where " + "budget_period = 'ADOPTED BUDGET FY" + year + "' and " + "`inc/dec` is null and " + "agency_id = " + req.params.agency + " and " + "unit_of_appropriation_id = " + req.params.unitOfAppropriation + " and " + "key = 'AMOUNT' " + "group by unit_of_appropriation_name " + "order by sum(value) DESC ";

  // Serialize the query result.
  var summary = [];
  db.serialize(function() {
    db.each(statement, function(err, result) {
      if (err) { console.log(err); }
      summary.push(result);
    }, function(){
      // When the serialization is done, return the array as a JSON.
      return res.json(summary);
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
