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

//all summary calls use this function
app.locals.summary = function(req,res) {
  var db = new sqlite3.Database(__dirname + "/" + app.dbPath);
  var year = Number(req.params.year) - 2000;
  var statementAdds = []; //array for additional WHERE clauses

  //lowestParam tells us how far into the hierarchy we are, affects query and 'more' link
  var lowestParam = "agency";

  //set lowestParam and add WHERE clause to array
  if(req.params.agency) {
    lowestParam = "unit_of_appropriation";
    statementAdds.push("agency_id = " + req.params.agency);
  } 
  if(req.params.uoa) {
    lowestParam = "responsibility_center";
    statementAdds.push("unit_of_appropriation_id = " + req.params.uoa);
  }
  if(req.params.rc) {
    lowestParam = "budget_code";
    if(req.params.rc == 'null') { //some responsibility centers are null, adjust query accordingly
      statementAdds.push("responsibility_center_id is null ");
    } else {
      statementAdds.push("responsibility_center_id = " + req.params.rc);
    }
    
  }
  if(req.params.bc) {
    lowestParam = "object_class";
    statementAdds.push("budget_code_id = " + req.params.bc);
  }

  //build the SQL query
  var statement;
  if(req.params.bc){ //object class does not have _id and _name, breaks convention
    statement = "select " + lowestParam + ", sum(value) ";
  } else {
    statement = "select " + lowestParam + "_id, " + lowestParam + "_name, sum(value) ";
  }

  statement +=    "from `alladopted` " +
                  "where " +
                  "budget_period = 'ADOPTED BUDGET FY" + year + "' and ";

  //add additional params to SQL statement if they exist in the array:
  statementAdds.forEach(function(i){
    statement += i + " and ";
  })

  statement += "`inc/dec` is null and " +
                  "key = 'AMOUNT' ";

  if(req.params.bc){ //same as above, object class needs special treatment
    statement += "group by " + lowestParam;
  } else {
    statement += "group by " + lowestParam + "_name";
  }               
  
  statement += " order by sum(value) DESC"; 

  console.log("Querying: " + statement);
  // Serialize the query result.
  var summary = [];
  db.serialize(function() {
    db.each(statement, function(err, result) {
      if (err) { console.log(err); }
      //build out the "more" url.  TODO: DRY this out...
      result.more = app.basePath + '/v1/year/2014/budget/op/agency/' + result.agency_id + '/summary.json';
      if (req.params.agency) {
        result.more = app.basePath + '/v1/year/2014/budget/op/agency/' + req.params.agency + '/uoa/' + result.unit_of_appropriation_id + '/summary.json';
      }
      if (req.params.uoa) {
        result.more = app.basePath + '/v1/year/2014/budget/op/agency/' + req.params.agency + '/uoa/' + req.params.uoa + '/rc/' + result.responsibility_center_id + '/summary.json';
      }
      if (req.params.rc) {
        result.more = app.basePath + '/v1/year/2014/budget/op/agency/' + req.params.agency + '/uoa/' + req.params.uoa + '/rc/' + req.params.rc + '/bc/' + result.budget_code_id + '/summary.json';
      }

      summary.push(result);
    }, function(){
      // When the serialization is done, return the array as JSON.
      return res.json(summary);
    })
  });
  };


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();        // get an instance of the express Router

//Each summary api call shares the same app.locals.summary function:

// citySummary
router.get('/year/:year/budget/op/summary.:format', app.locals.summary);
// agencySummary
router.get('/year/:year/budget/op/agency/:agency/summary.:format',  app.locals.summary);
// uoaSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/summary.:format', app.locals.summary);
// rcSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/rc/:rc/summary.:format', app.locals.summary);
//ocSummary
router.get('/year/:year/budget/op/agency/:agency/uoa/:uoa/rc/:rc/bc/:bc/summary.:format', app.locals.summary);



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/v1', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Express server listening on port ' + port);
