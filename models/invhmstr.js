'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvhMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InvhMstr.init({
    invh_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    invh_tran_id: DataTypes.INTEGER,
    invh_seq: DataTypes.INTEGER,
    invh_dom_id: DataTypes.INTEGER,
    invh_en_id: DataTypes.INTEGER,
    invh_trn_code: DataTypes.STRING,
    invh_trn_oid: DataTypes.UUID,
    invh_date: DataTypes.DATEONLY,
    invh_desc: DataTypes.STRING,
    invh_opn_type: DataTypes.STRING,
    invh_si_id: DataTypes.INTEGER,
    invh_loc_id: DataTypes.INTEGER,
    invh_pt_id: DataTypes.INTEGER,
    invh_qty: DataTypes.INTEGER,
    invh_cost: DataTypes.INTEGER,
    invh_serial: DataTypes.STRING,
    dt_timestamp: DataTypes.DATE,
    invh_avg_cost: DataTypes.INTEGER,
    invh_qty_old: DataTypes.INTEGER,
    invh_pjc_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'invh_mstr',
    timestamps: false,
    modelName: 'InvhMstr',
  });
  return InvhMstr;
};