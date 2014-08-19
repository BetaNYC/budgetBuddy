module.exports = function(sequelize, DataTypes) {
  var AllAdopted = sequelize.define('AllAdopted', {
      agency_id: DataTypes.INTEGER
    , key: DataTypes.STRING
    , agency_name: DataTypes.STRING
    , unit_of_appropriation_id: DataTypes.INTEGER
    , unit_of_appropriation_name: DataTypes.STRING
    , responsibility_center_id: DataTypes.INTEGER
    , responsibility_center_name: DataTypes.STRING
    , budget_code_id: DataTypes.INTEGER
    , budget_code_name: DataTypes.STRING
    , object_class: DataTypes.STRING
    , ic_ref: DataTypes.STRING
    , obj: DataTypes.STRING
    , description: DataTypes.STRING
    , budget_period: DataTypes.STRING
    , inc_dec: DataTypes.STRING
    , key: DataTypes.STRING
    , value: DataTypes.INTEGER
    , file_name: DataTypes.STRING
    , source_line: DataTypes.INTEGER
  }, {
    tableName: "alladopted",
    classMethods: {

    }
  })

  return AllAdopted
}
