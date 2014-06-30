module.exports = (app) ->
  app.get '/v1/budget/:year.:format', app.RequestsController.budget

  
  NotFound = (res) ->
    res.render '404', status: 404, view: 'four-o-four'