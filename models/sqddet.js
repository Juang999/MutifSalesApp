'use strict';
const {
  Model
} = require('sequelize');
const {
  v4: uuidv4
} = require('uuid')
module.exports = (sequelize, DataTypes) => {
  class SqdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SqdDet.belongsTo(models.PtMstr, {
        as: 'product',
        targetKey: 'pt_id',
        foreignKey: 'sqd_pt_id'
      })
    }
  }
  SqdDet.init({
    sqd_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4()
    },
    sqd_dom_id: DataTypes.INTEGER,
    sqd_en_id: DataTypes.INTEGER,
    sqd_add_by: DataTypes.STRING,
    sqd_add_date: DataTypes.DATE,
    sqd_upd_by: DataTypes.STRING,
    sqd_upd_date: DataTypes.DATE,
    sqd_sq_oid: DataTypes.UUID,
    sqd_seq: DataTypes.INTEGER,
    sqd_is_additional_charge: DataTypes.STRING,
    sqd_si_id: DataTypes.INTEGER,
    sqd_pt_id: DataTypes.INTEGER,
    sqd_rmks: DataTypes.STRING,
    sqd_qty: DataTypes.INTEGER,
    sqd_qty_allocated: DataTypes.INTEGER,
    sqd_qty_picked: DataTypes.INTEGER,
    sqd_qty_shipment: DataTypes.INTEGER,
    sqd_qty_pending_inv: DataTypes.INTEGER,
    sqd_qty_invoice: DataTypes.INTEGER,
    sqd_um: DataTypes.INTEGER,
    sqd_cost: DataTypes.INTEGER,
    sqd_price: DataTypes.INTEGER,
    sqd_disc: DataTypes.INTEGER,
    sqd_sales_ac_id: DataTypes.INTEGER,
    sqd_sales_sb_id: DataTypes.INTEGER,
    sqd_sales_cc_id: DataTypes.INTEGER,
    sqd_disc_ac_id: DataTypes.INTEGER,
    sqd_um_conv: DataTypes.INTEGER,
    sqd_qty_real: DataTypes.INTEGER,
    sqd_taxable: DataTypes.STRING,
    sqd_tax_inc: DataTypes.STRING,
    sqd_tax_class: DataTypes.INTEGER,
    sqd_status: DataTypes.STRING,
    sqd_dt: DataTypes.DATE,
    sqd_payment: DataTypes.INTEGER,
    sqd_dp: DataTypes.INTEGER,
    sqd_sales_unit: DataTypes.INTEGER,
    sqd_loc_id: DataTypes.INTEGER,
    sqd_serial: DataTypes.STRING,
    sqd_qty_return: DataTypes.INTEGER,
    sqd_ppn_type: DataTypes.STRING,
    sqd_pod_oid: DataTypes.UUID,
    sqd_qty_ir: DataTypes.INTEGER,
    sqd_invc_oid: DataTypes.UUID,
    sqd_invc_loc_id: DataTypes.INTEGER,
    sqd_need_date: DataTypes.DATEONLY,
    sqd_qty_transfer_receipt: DataTypes.INTEGER,
    sqd_qty_transfer_issue: DataTypes.INTEGER,
    sqd_total_amount_price: DataTypes.INTEGER,
    sbd_qty_riud: DataTypes.INTEGER,
    sbd_qty_processed: DataTypes.INTEGER,
    sbd_qty_completed: DataTypes.INTEGER,
    sqd_qty_transfer: DataTypes.INTEGER,
    sqd_qty_so: DataTypes.INTEGER,
    sqd_qty_maxorder: DataTypes.INTEGER,
    sqd_commision: DataTypes.INTEGER,
    sqd_commision_total: DataTypes.INTEGER,
    sqd_sales_unit_total: DataTypes.INTEGER,
    sqd_sqd_oid: DataTypes.UUID,
    sodas_sq_oid: DataTypes.UUID,
    sqd_qty_booking: DataTypes.INTEGER,
    sqd_qty_outs: DataTypes.INTEGER,
    sq_dropshipper: DataTypes.STRING,
    sqd_invc_qty: DataTypes.INTEGER,
    sqd_ptnr_id: DataTypes.INTEGER,
    sqd_locs_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName:'sqd_det',
    modelName: 'SqdDet',
  });
  return SqdDet;
};