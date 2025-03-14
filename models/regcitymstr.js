'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegCityMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegCityMstr.init({
    kota_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    kota_prop_id: DataTypes.INTEGER,
    kota_prop_kode: DataTypes.STRING,
    kota_id: DataTypes.INTEGER,
    kota_code: DataTypes.STRING,
    kota_name: DataTypes.STRING,
    kota_active: DataTypes.STRING,
    kota_add_by: DataTypes.STRING,
    kota_add_date: DataTypes.DATE,
    kota_upd_by: DataTypes.STRING,
    kota_upd_date: DataTypes.DATE
  }, {
    sequelize,
    schema: 'public',
    tableName: 'reg_city_mstr',
    timestamps: false,
    modelName: 'RegCityMstr',
  });
  return RegCityMstr;
};