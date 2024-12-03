'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DbrMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DbrMstr.hasMany(models.DbrdDet, {
        as: 'detail_point',
        sourceKey: 'dbr_oid',
        foreignKey: 'dbrd_dbr_oid'
      })

      DbrMstr.hasOne(models.DbrdDet, {
        as: 'singular_detail_point',
        sourceKey: 'dbr_oid',
        foreignKey: 'dbrd_dbr_oid'
      })

      DbrMstr.belongsTo(models.SlsProgram, {
        as: 'sales_program',
        foreignKey: 'dbr_slsprog_id',
        targetKey: 'sls_id'
      })
    }
  }
  DbrMstr.init({
    dbr_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    dbr_code: DataTypes.STRING,
    dbr_date: DataTypes.DATEONLY,
    dbr_dbgcity_id: DataTypes.INTEGER,
    dbr_start_date: DataTypes.DATE,
    dbr_end_date: DataTypes.DATE,
    dbr_remarks: DataTypes.STRING,
    dbr_add_date: DataTypes.DATE,
    dbr_add_by: DataTypes.STRING,
    dbr_upd_date: DataTypes.DATE,
    dbr_upd_by: DataTypes.STRING,
    dbr_dbg_oid: DataTypes.UUID,
    dbr_slsprog_id: DataTypes.INTEGER,
    dbr_periode_id: DataTypes.INTEGER,
    dbr_periode_point: DataTypes.INTEGER,
    dbr_close_stat: DataTypes.STRING,
    dbr_close_date: DataTypes.DATEONLY,
    dbr_prev_point: DataTypes.INTEGER,
    dbr_policy_point: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'dbr_mstr',
    timestamps: false,
    modelName: 'DbrMstr',
  });
  return DbrMstr;
};