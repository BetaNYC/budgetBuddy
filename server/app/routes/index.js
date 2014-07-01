module.exports = function(app) {
  var NotFound;

  app.get('/v1/:year/op/summary.:format', app.RequestsController.citySummary);
  app.get('/v1/:year/op/:agency/summary.:format', app.RequestsController.agencySummary);

  return NotFound = function(res) {
    return res.render('404', {
      status: 404,
      view: 'four-o-four'
    });
  };
}