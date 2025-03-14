'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PsPeriodeMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PsPeriodeMstr.init({
    periode_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    periode_code: DataTypes.STRING,
    periode_start_date: DataTypes.DATEONLY,
    periode_end_date: DataTypes.DATEONLY,
    periode_active: DataTypes.STRING,
    periode_add_by: DataTypes.STRING,
    periode_add_date: DataTypes.DATE,
    periode_upd_by: DataTypes.STRING,
    periode_upd_date: DataTypes.DATE,
    periode_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'ps_periode_mstr',
    timestamps: false,
    modelName: 'PsPeriodeMstr',
  });
  return PsPeriodeMstr;
};