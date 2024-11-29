'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DbgdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DbgdDet.init({
    dbgd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    dbgd_dbg_oid: DataTypes.UUID,
    dbgd_en_id: DataTypes.INTEGER,
    dbgd_ptnr_id: DataTypes.INTEGER,
    dbgd_dbg_id: DataTypes.INTEGER,
    dbgd_parent_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'dbgd_det',
    timestamps: false,
    modelName: 'DbgdDet',
  });
  return DbgdDet;
};