'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DbrdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DbrdDet.init({
    dbrd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    dbrd_dbr_oid: DataTypes.UUID,
    dbrd_seq: DataTypes.INTEGER,
    dbrd_en_id: DataTypes.INTEGER,
    dbrd_en_desc: DataTypes.STRING,
    dbrd_ar_oid: DataTypes.UUID,
    dbrd_ar_eff_date: DataTypes.DATE,
    dbrd_ar_date: DataTypes.DATE,
    dbrd_ar_code: DataTypes.STRING,
    dbrd_ars_invoice: DataTypes.INTEGER,
    dbrd_ar_final: DataTypes.INTEGER,
    dbrd_so_amount: DataTypes.INTEGER,
    dbrd_so_point: DataTypes.INTEGER,
    dbrd_ar_amount: DataTypes.INTEGER,
    dbrd_ret_amount: DataTypes.INTEGER,
    dbrd_drcr_tot: DataTypes.INTEGER,
    dbrd_point: DataTypes.INTEGER,
    dbrd_ar_duedate: DataTypes.DATE,
    dbrd_arpayd_date: DataTypes.DATE,
    dbrd_ar_close_date: DataTypes.DATE,
    dbrd_arpay_code: DataTypes.STRING,
    dbrd_apyad_amount: DataTypes.INTEGER,
    dbrd_tot_point: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'dbrd_det',
    timestamps: false,
    modelName: 'DbrdDet',
  });
  return DbrdDet;
};