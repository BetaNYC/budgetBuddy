var app, configureSwagger, express, http, partials, swagger, yaml;

var sqlite3 = require("sqlite3");

var express = require('express');

http = require('http');

partials = require('express-partials');

app = express();

//swagger = require('swagger-jack');

yaml = require('js-yaml');

require("" + __dirname + "/../config/boot")(app);

configureSwagger = function(env) {
  var basePath, descriptor, resources;
  basePath = env === "production" ? 'http://open311.herokuapp.com' : 'http://localhost:3000';
  descriptor = {
    apiVersion: '1.0',
    basePath: basePath
  };
  resources = [
    {
      api: require("" + __dirname + "/../schema/requests.yml"),
      controller: app.RequestsController
    }
  ];
  //app.use(swagger.generator(app, descriptor, resources));
  //app.use(swagger.validator(app));
  //return app.use(swagger.errorHandler());
};

app.configure(function() {
  var port;
  port = process.env.PORT || 3000;
  if (process.argv.indexOf('-p') >= 0) {
    port = process.argv[process.argv.indexOf('-p') + 1];
  }
  app.set('port', port);
  app.use(express["static"]("" + __dirname + "/../public"));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(partials());
  app.use(require('connect-assets')({
    src: "" + __dirname + "/assets"
  }));
  app.use(app.router);
  //return configureSwagger(app.currentEnv);
});

app.configure('development', function() {
  return app.use(express.errorHandler());
});

require("" + __dirname + "/routes")(app);

http.createServer(app).listen(app.get('port'), function() {
  return console.log("Express server listening on port " + (app.get('port')) + " in " + app.settings.env + " mode");
});
