var _ = require("underscore");
var sqlite3 = require('sqlite3').verbose();
var dbPath = __dirname + '/../../data/processed/all.db';
var db = new sqlite3.Database(dbPath);
var basePath =

module.exports = function(app) {
  return app.API = (function() {
    function API() {}

    API.citySummary = function(req, res) {
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
          result.more = app.basePath + '/v1/2014/op/' + result.agency_id + '/summary.json'
          summary.push(result);
        }, function(){
          var obj = summary;
          return app.helpers.output(obj, res, req.params.format);
        });
      });

    };

    API.agencySummary = function(req, res) {
      var summary = [];
      // BAD BAD BAD, we should use real SQL params.  But this is just a demo.
      var year = Number(req.params.year) - 2000;

      var statement = "select  responsibility_center_name, responsibility_center_name, sum(value) " +
                      "from `all` " +
                      "where " +
                      "budget_period = 'EXECUTIVE BUDGET FY" + year + "' and " +
                      "`inc/dec` is null and " +
                      "agency_id = " + req.params.agency + " and " +
                      "key = 'AMOUNT' " +
                      "group by responsibility_center_name " +
                      "order by sum(value) DESC ";
      console.log(statement);
      db.serialize(function() {
        db.each(statement, function(err, result) {
          if (err) { console.log(err); }
          summary.push(result);
        }, function(){
          var obj = summary;
          return app.helpers.output(obj, res, req.params.format);
        });
      });

    };

    return API;

  })();
};
