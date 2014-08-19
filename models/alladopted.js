module.exports = function(sequelize, DataTypes) {
  var AllAdopted = sequelize.define('AllAdopted', {
    username: DataTypes.STRING
  }, {
    classMethods: {

    }
  })

  return AllAdopted
}
