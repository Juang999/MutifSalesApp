'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PtnracCntc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PtnracCntc.init({
    ptnrac_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    addrc_ptnra_oid: DataTypes.UUID,
    ptnrac_add_by: DataTypes.STRING,
    ptnrac_add_date: DataTypes.DATE,
    ptnrac_seq: DataTypes.INTEGER,
    ptnrac_function: DataTypes.INTEGER,
    ptnrac_contact_name: DataTypes.STRING,
    ptnrac_phone_1: DataTypes.STRING,
    ptnrac_phone_2: DataTypes.STRING,
    ptnrac_email: DataTypes.STRING,
    ptnrac_dt: DataTypes.DATE,
    ptnrac_upd_by: DataTypes.STRING,
    ptnrac_upd_date: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'ptnrac_cntc',
    timestamps: false,
    schema: 'public',
    modelName: 'PtnracCntc',
  });
  return PtnracCntc;
};