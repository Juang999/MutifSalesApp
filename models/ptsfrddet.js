'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PtsfrdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PtsfrdDet.belongsTo(models.PtMstr, {
        as: 'detail_product',
        targetKey: 'pt_id',
        foreignKey: 'ptsfrd_pt_id'
      })
    }
  }
  PtsfrdDet.init({
    ptsfrd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    ptsfrd_ptsfr_oid: DataTypes.UUID,
    ptsfrd_seq: DataTypes.INTEGER,
    ptsfrd_pt_id: DataTypes.INTEGER,
    ptsfrd_qty: DataTypes.INTEGER,
    ptsfrd_qty_receive: DataTypes.INTEGER,
    ptsfrd_um: DataTypes.INTEGER,
    ptsfrd_si_to_id: DataTypes.INTEGER,
    ptsfrd_loc_to_id: DataTypes.INTEGER,
    ptsfrd_lot_serial: DataTypes.STRING,
    ptsfrd_cost: DataTypes.INTEGER,
    _dt: DataTypes.DATE,
    ptsfrd_pbd_oid: DataTypes.UUID,
    ptsfrd_sqd_oid: DataTypes.UUID,
    ptsfrd_sod_oid: DataTypes.UUID,
    ptsfrd_pb_oid: DataTypes.UUID,
    ptsfrd_pb_code: DataTypes.STRING,
    ptsfrd_remarks: DataTypes.STRING,
    ptsfrd_invc_oid: DataTypes.UUID
  }, {
    sequelize,
    tableName: 'ptsfrd_det',
    schema: 'public',
    timestamps: false,
    modelName: 'PtsfrdDet',
  });
  return PtsfrdDet;
};