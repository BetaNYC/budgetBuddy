module.exports = function(app) {
  app.currentEnv = process.env.NODE_ENV || 'development';
  app.helpers = require("" + __dirname + "/../app/helpers");
  app.helpers.autoload("" + __dirname + "/../lib", app);
  return app.helpers.autoload("" + __dirname + "/../app/controllers", app);
};
