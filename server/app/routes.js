module.exports = function(app) {

  app.get('/v1/:year/op/summary.:format', app.API.citySummary);
  app.get('/v1/:year/op/:agency/summary.:format', app.API.agencySummary);
  app.get('/v1/:year/op/:agency/:unitOfAppropriation/summary.:format', app.API.uoaSummary);

}