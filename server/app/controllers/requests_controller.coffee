_ = require("underscore")
module.exports = (app) ->
  class app.RequestsController
    # GET /v1/budget.[format]
    @budget = (req, res) ->
      obj =
        text: "hello world"
      app.helpers.output(obj, res, req.params.format)