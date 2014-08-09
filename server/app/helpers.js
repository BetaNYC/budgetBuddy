module.exports = function (app) {
  app.helpers = {};
  return app.helpers.output = function(obj, res, format) {
    if (obj.length === 0) {
      return res.send(404, "not found");
    } else {
      switch (format) {
        case "json":
          res.type("application/json");
          return res.send(obj);
      }
    }
  };
}

