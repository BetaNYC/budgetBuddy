// require('coffee-script/register')
// require("./app/app.js")

var app, configureSwagger, express, http, partials, swagger, yaml;
var sqlite3 = require("sqlite3");
var express = require('express');
var env = require(__dirname + "/../env.json");
var fs   = require('fs');

http = require('http');
app = express();
app.currentEnv = process.env.NODE_ENV || 'development';

app.basePath = env[app.currentEnv]["base_path"];
app.dbPath = env[app.currentEnv]["db_path"];

swagger = require('swagger-jack');

yaml = require('js-yaml');


configureSwagger = function(env) {
  var descriptor, resources;
  descriptor = {
    apiVersion: '1.0',
    basePath: app.basePath + "/docs.json"
  };
  // FIXME: the schema is not parsed like a yml, but like json file.
  var schema = yaml.safeLoad(fs.readFileSync("" + __dirname + "/app/schema.yml"));
  resources = [
    {
      api: schema,
      controller: app.API
    }
  ];
  app.use(swagger.generator(app, descriptor, resources));
  app.use(swagger.validator(app));
  return app.use(swagger.errorHandler());
};

app.configure(function() {
  var port;
  port = process.env.PORT || 3000;
  if (process.argv.indexOf('-p') >= 0) {
    port = process.argv[process.argv.indexOf('-p') + 1];
  }
  app.set('port', port);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  return configureSwagger(app.currentEnv);
});

app.configure('development', function() {
  return app.use(express.errorHandler());
});

require("" + __dirname + "/app/helpers.js")(app);
require("" + __dirname + "/app/api.js")(app);
require("" + __dirname + "/app/routes.js")(app);

http.createServer(app).listen(app.get('port'), function() {
  return console.log("Express server listening on port " + (app.get('port')) + " in " + app.settings.env + " mode");
});

