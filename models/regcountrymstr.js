'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegCountryMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegCountryMstr.init({
    country_oid: DataTypes.UUID,
    country_id: DataTypes.INTEGER,
    country_code: DataTypes.STRING,
    country_name: DataTypes.STRING,
    country_active: DataTypes.STRING,
    country_add_by: DataTypes.STRING,
    country_add_date: DataTypes.DATE,
    country_upd_by: DataTypes.STRING,
    country_upd_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'RegCountryMstr',
  });
  return RegCountryMstr;
};