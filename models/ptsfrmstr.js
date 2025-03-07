'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PtsfrMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PtsfrMstr.hasOne(models.PtsfrdDet, {
        as: 'singular_detail_transfer',
        sourceKey: 'ptsfr_oid',
        foreignKey: 'ptsfrd_ptsfr_oid'
      })

      PtsfrMstr.hasMany(models.PtsfrdDet, {
        as: 'detail_transfer',
        sourceKey: 'ptsfr_oid',
        foreignKey: 'ptsfrd_ptsfr_oid'
      })

      PtsfrMstr.belongsTo(models.LocMstr, {
        as: 'destination_location',
        targetKey: 'loc_id',
        foreignKey: 'ptsfr_loc_to_id'
      })

      PtsfrMstr.belongsTo(models.TransStatus, {
        as: 'status_transfer',
        targetKey: 'trans_id',
        foreignKey: 'ptsfr_trans_id'
      })
    }
  }
  PtsfrMstr.init({
    ptsfr_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    ptsfr_dom_id: DataTypes.INTEGER,
    ptsfr_en_id: DataTypes.INTEGER,
    ptsfr_add_by: DataTypes.STRING,
    ptsfr_add_date: DataTypes.DATE,
    ptsfr_upd_by: DataTypes.STRING,
    ptsfr_upd_date: DataTypes.DATE,
    ptsfr_en_to_id: DataTypes.INTEGER,
    ptsfr_code: DataTypes.STRING,
    ptsfr_date: DataTypes.DATEONLY,
    ptsfr_receive_date: DataTypes.DATEONLY,
    ptsfr_si_id: DataTypes.INTEGER,
    ptsfr_loc_id: DataTypes.INTEGER,
    ptsfr_loc_git: DataTypes.INTEGER,
    ptsfr_remarks: DataTypes.STRING,
    ptsfr_trans_id: DataTypes.STRING,
    ptsfr_dt: DataTypes.DATE,
    ptsfr_loc_to_id: DataTypes.INTEGER,
    ptsfr_si_to_id: DataTypes.INTEGER,
    ptsfr_pb_oid: DataTypes.UUID,
    ptsfr_so_oid: DataTypes.UUID,
    pt_tax_class: DataTypes.STRING,
    ptsfr_tran_id: DataTypes.INTEGER,
    ptsfr_sq_oid: DataTypes.UUID,
    ptsfr_is_transfer: DataTypes.STRING,
    ptsfr_auto_receipts: DataTypes.STRING,
    ptsfr_booking: DataTypes.STRING,
    ptsfr_cons: DataTypes.STRING,
    ptsfr_sq_ptnr_id: DataTypes.INTEGER,
    ptsfr_sq_dbg_id: DataTypes.INTEGER,
    ptsfr_ds_ptnr_id: DataTypes.INTEGER,
    ptsfr_dropship: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    tableName: 'ptsfr_mstr',
    timestamps: false,
    modelName: 'PtsfrMstr',
  });
  return PtsfrMstr;
};