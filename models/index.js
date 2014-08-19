var fs        = require('fs')
  , path      = require('path')
  , Sequelize = require('sequelize')
  , lodash    = require('lodash')
  , env       = require(__dirname + "/../env.json")
  , db        = {};

if(process.env.NODE_ENV == "development"){
  var storage_path = env[process.env.NODE_ENV].database;
  var sequelize = new Sequelize('alladopted', null, null, {storage: storage_path, dialect: "sqlite"});
}else{
  // WIP
  // var sequelize = new Sequelize('alladopted', 'postgres', 'postgres');
}





fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);
