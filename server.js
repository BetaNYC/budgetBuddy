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
var db         = require('./models')



var port = process.env.PORT || 3000;


// CONFIGURATIONS
// =============================================================================

// APPLICATION
app.currentEnv  = process.env.NODE_ENV || 'development';
app.basePath    = env[app.currentEnv]["base_path"];
app.database    = env[app.currentEnv]["database"];


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

  var year = Number(req.params.year) - 2000;

  var statement = "select agency_id, agency_name, value " +
                  "from alladopted " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and " +
                  "inc_dec is null and " +
                  "key = 'AMOUNT' " +
                  "group by agency_name " +
                  "order by value DESC ";

  // Serialize the query result.
  // db.sequelize.query(statement).success(function(result) {
  db.AllAdopted.findAll({where: {budget_period: "ADOPTED BUDGET FY" + year, inc_dec: null, key: "AMOUNT"}, attributes: ["agency_id", "agency_name", "value"], order: "value DESC"}).success(function(result) {
    // Add the more field to each row
    result.map(function(row) {
      row.more = app.basePath + '/v1/year/'+ req.params.year +'/budget/op/' + 'agency/' + row.agency_id + '/summary.json';
    })

    // When the serialization is done, return the array as a JSON.
    return res.json(result);
  })

});


// agencySummary
router.get('/year/:year/budget/op/agency/:agency/summary.:format', function(req, res) {

  var year = Number(req.params.year) - 2000;

  var statement = "select  unit_of_appropriation_name, unit_of_appropriation_id, value " +
                  "from alladopted " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and " +
                  "inc_dec is null and " +
                  "agency_id = " + req.params.agency + " and " +
                  "key = 'AMOUNT' " +
                  "group by unit_of_appropriation_name " +
                  "order by value DESC ";

  // Serialize the query result.
  db.sequelize.query(statement).success(function(result) {
  // db.AllAdopted.findAll({attributes: ["unit_of_appropriation_name", "unit_of_appropriation_id"]}).success(function(result) {
    // When the serialization is done, return the array as a JSON.
    return res.json(result);
  })

});

// uoaSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/summary.:format', function(req, res) {

  var year = Number(req.params.year) - 2000;

  var statement = "select responsibility_center_name, responsibility_center_id, value " +
    "from alladopted " + "where " + "budget_period = 'ADOPTED BUDGET FY" + year + "' and " + "inc_dec is null and " + "agency_id = " + req.params.agency + " and " + "unit_of_appropriation_id = " + req.params.unitOfAppropriation + " and " + "key = 'AMOUNT' " + "group by unit_of_appropriation_name " + "order by value DESC ";

  // Serialize the query result.
  db.sequelize.query(statement).success(function(result) {
    // When the serialization is done, return the array as a JSON.
    return res.json(result);
  })

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

db.sequelize.sync({ force: true }).complete(function(err) {
  if (err) {
    throw err[0]
  } else {
    app.listen(port);
    console.log('Express server listening on port ' + port);
  }
});
