module.exports = function (app) {

  app.configureSwagger = function(env) {
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


}

