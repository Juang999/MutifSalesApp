'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PtnrgGrp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PtnrgGrp.init({
    ptnrg_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    ptnrg_dom_id: DataTypes.INTEGER,
    ptnrg_en_id: DataTypes.INTEGER,
    ptnrg_id: DataTypes.INTEGER,
    ptnrg_add_by: DataTypes.STRING,
    ptnrg_add_date: DataTypes.DATE,
    ptnrg_upd_by: DataTypes.STRING,
    ptnrg_upd_date: DataTypes.DATE,
    ptnrg_code: DataTypes.STRING,
    ptnrg_name: DataTypes.STRING,
    ptnrg_desc: DataTypes.STRING,
    ptnrg_active: DataTypes.STRING,
    ptnrg_dt: DataTypes.DATE,
    ptnrg_payment_methode: DataTypes.INTEGER,
    ptnrg_credit_term: DataTypes.INTEGER,
    ptnrg_limit_credit: DataTypes.INTEGER,
    ptnrg_ap_ac_id: DataTypes.INTEGER,
    ptnrg_ar_ac_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'ptnrg_grp',
    modelName: 'PtnrgGrp',
  });
  return PtnrgGrp;
};