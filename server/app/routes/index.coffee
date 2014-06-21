module.exports = (app) ->
  app.get '/', app.ApplicationController.index
  app.get '/requests.:format?', app.RequestsController.getServiceRequests
  app.get '/requests/:uid.:format', app.RequestsController.getServiceRequest
  app.get '/discovery.:format', app.ApplicationController.discovery

  # Error handling (No previous route found. Assuming it’s a 404)
  # app.get '/*', (req, res) ->
  #   NotFound res

  NotFound = (res) ->
    res.render '404', status: 404, view: 'four-o-four'