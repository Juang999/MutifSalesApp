'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PtCatMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PtCatMstr.hasOne(models.PtMstr, {
        as: 'product',
        sourceKey: 'ptcat_id',
        foreignKey: 'pt_cat_id'
      })
    }
  }
  PtCatMstr.init({
    ptcat_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    ptcat_code: DataTypes.STRING,
    ptcat_group_id: DataTypes.INTEGER,
    ptcat_id: DataTypes.INTEGER,
    ptcat_desc: DataTypes.STRING,
    ptcat_active: DataTypes.STRING,
    ptcat_add_by: DataTypes.STRING,
    ptcat_add_date: DataTypes.DATE,
    ptcat_upd_by: DataTypes.STRING,
    ptcat_upd_date: DataTypes.DATE
  }, {
    sequelize,
    timestamps: false,
    schema: 'public',
    tableName: 'ptcat_mstr',
    modelName: 'PtCatMstr',
  });
  return PtCatMstr;
};