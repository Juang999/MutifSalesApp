'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegKelMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegKelMstr.init({
    kel_oid: DataTypes.UUID,
    kel_kec_id: DataTypes.INTEGER,
    kel_kec_code: DataTypes.STRING,
    kel_id: DataTypes.INTEGER,
    kel_code: DataTypes.STRING,
    kel_name: DataTypes.STRING,
    kel_desc: DataTypes.STRING,
    kel_active: DataTypes.STRING,
    kel_add_by: DataTypes.STRING,
    kel_add_date: DataTypes.DATE,
    kel_upd_by: DataTypes.STRING,
    kel_upd_date: DataTypes.DATE
  }, {
    sequelize,
    timestamps: false,
    schema: 'public',
    tableName:'reg_kel_mstr',
    modelName: 'RegKelMstr',
  });
  return RegKelMstr;
};