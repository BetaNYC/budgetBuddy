module.exports = (app) ->
  class app.ApplicationController

    # GET /
    @index = (req, res) ->
      res.render 'index', view: 'index'

    # GET /discovery.[format]
    # http://wiki.open311.org/Service_Discovery
    @discovery = (req, res) ->
      discovery =
        changeset: "2013-05-01 12:00:00"
        contact: "E-mail dev-support@platform.nyc.gov or visit developer.cityofnewyork.us for more information."
        key_service: "You can request a key at developer.cityofnewyork.us."
        endpoints: [
          specification: "http://wiki.open311.org/GeoReport_v2"
          url: "https://api.cityofnewyork.us/open311/v1"
          changeset: "2013-05-01 12:00:00"
          type: "production"
          formats: ["text/xml", "application/json"]
        ]
      app.helpers.output discovery, "discovery", res, req.params.format