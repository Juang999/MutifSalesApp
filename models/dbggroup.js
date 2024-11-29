'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DbgGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DbgGroup.init({
    dbg_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    dbg_code: DataTypes.STRING,
    dbg_name: DataTypes.STRING,
    dbg_city_id: DataTypes.INTEGER,
    dbg_remarks: DataTypes.STRING,
    dbg_add_by: DataTypes.STRING,
    dbg_add_date: DataTypes.DATE,
    dbg_upd_by: DataTypes.STRING,
    dbg_upd_date: DataTypes.DATE,
    dbg_desc: DataTypes.STRING,
    dbg_ptnrg_id: DataTypes.INTEGER,
    dbg_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'dbg_group',
    timestamps: false,
    modelName: 'DbgGroup',
  });
  return DbgGroup;
};