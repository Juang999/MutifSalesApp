'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegPropMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegPropMstr.init({
    prop_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    prop_code: DataTypes.STRING,
    prop_name: DataTypes.STRING,
    prop_desc: DataTypes.STRING,
    prop_active: DataTypes.STRING,
    prop_add_by: DataTypes.STRING,
    prop_add_date: DataTypes.DATE,
    prop_upd_by: DataTypes.STRING,
    prop_upd_date: DataTypes.DATE,
    prop_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'reg_prop_mstr',
    timestamps: false,
    modelName: 'RegPropMstr',
  });
  return RegPropMstr;
};