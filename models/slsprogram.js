'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SlsProgram extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SlsProgram.init({
    sls_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    sls_id: DataTypes.INTEGER,
    sls_code: DataTypes.STRING,
    sls_name: DataTypes.STRING,
    sls_desc: DataTypes.STRING,
    sls_active: DataTypes.STRING,
    sls_add_by: DataTypes.STRING,
    sls_add_date: DataTypes.DATE,
    sls_upd_by: DataTypes.STRING,
    sls_upd_date: DataTypes.DATE,
    sls_dt: DataTypes.DATE
  }, {
    sequelize,
    schema: 'public',
    tableName:'sls_program',
    timestamps: false,
    modelName: 'SlsProgram',
  });
  return SlsProgram;
};