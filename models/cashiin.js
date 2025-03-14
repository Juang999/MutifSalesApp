'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CashiIn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      CashiIn.belongsTo(models.PtnrMstr, {
        as: 'detail_partner',
        targetKey: 'ptnr_id',
        foreignKey: 'cashi_ptnr_id'
      })
    }
  }
  CashiIn.init({
    cashi_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    cashi_dom_id: DataTypes.INTEGER,
    cashi_en_id: DataTypes.INTEGER,
    cashi_add_by: DataTypes.STRING,
    cashi_add_date: DataTypes.DATE,
    cashi_upd_by: DataTypes.STRING,
    cashi_upd_date: DataTypes.DATE,
    cashi_bk_id: DataTypes.INTEGER,
    cashi_ptnr_id: DataTypes.INTEGER,
    cashi_code: DataTypes.STRING,
    cashi_date: DataTypes.DATE,
    cashi_remarks: DataTypes.STRING,
    cashi_reff: DataTypes.STRING,
    cashi_amount: DataTypes.INTEGER,
    cashi_check_number: DataTypes.STRING,
    cashi_post_dated_check: DataTypes.STRING,
    cashi_cu_id: DataTypes.INTEGER,
    cashi_exc_rate: DataTypes.INTEGER,
    cashi_is_reverse: DataTypes.STRING,
    cashi_so_oid: DataTypes.UUID,
    cashi_amount_used: DataTypes.INTEGER,
    cashi_amount_remains: DataTypes.INTEGER,
    cashi_reverse: DataTypes.STRING,
    cashi_reff_oid: DataTypes.UUID,
    cashi_reff_code: DataTypes.STRING,
    cashi_close_temp: DataTypes.STRING,
    cashi_invest_code: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    tableName: 'cashi_in',
    timestamps: false,
    modelName: 'CashiIn',
  });
  return CashiIn;
};