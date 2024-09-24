'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegKecMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegKecMstr.init({
    kec_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    kec_kota_id: DataTypes.INTEGER,
    kec_kota_code: DataTypes.STRING,
    kec_id: DataTypes.INTEGER,
    kec_code: DataTypes.STRING,
    kec_name: DataTypes.STRING,
    kec_desc: DataTypes.STRING,
    kec_active: DataTypes.STRING,
    kec_add_by: DataTypes.STRING,
    kec_add_date: DataTypes.DATE,
    kec_upd_by: DataTypes.STRING,
    kec_upd_date: DataTypes.DATE
  }, {
    sequelize,
    schema: 'public',
    tableName:'reg_kec_mstr',
    timestamps: false,
    modelName: 'RegKecMstr',
  });
  return RegKecMstr;
};