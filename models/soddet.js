'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SodDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SodDet.belongsTo(models.SoMstr, {
        as: 'master_sales_order',
        foreignKey: 'sod_so_oid',
        targetKey: 'so_oid'
      })

      SodDet.belongsTo(models.PtMstr, {
        as: 'product',
        foreignKey: 'sod_pt_id',
        targetKey: 'pt_id'
      })
    }
  }
  SodDet.init({
    sod_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    sod_dom_id: DataTypes.INTEGER,
    sod_en_id: DataTypes.INTEGER,
    sod_add_by: DataTypes.STRING,
    sod_add_date: DataTypes.DATE,
    sod_upd_by: DataTypes.STRING,
    sod_upd_date: DataTypes.DATE,
    sod_so_oid: DataTypes.UUID,
    sod_seq: DataTypes.INTEGER,
    sod_is_additional_charge: DataTypes.STRING,
    sod_si_id: DataTypes.INTEGER,
    sod_pt_id: DataTypes.INTEGER,
    sod_rmks: DataTypes.STRING,
    sod_qty: DataTypes.INTEGER,
    sod_qty_allocated: DataTypes.INTEGER,
    sod_qty_picked: DataTypes.INTEGER,
    sod_qty_shipment: DataTypes.INTEGER,
    sod_qty_pending_inv: DataTypes.INTEGER,
    sod_qty_invoice: DataTypes.INTEGER,
    sod_um: DataTypes.INTEGER,
    sod_cost: DataTypes.INTEGER,
    sod_price: DataTypes.INTEGER,
    sod_disc: DataTypes.INTEGER,
    sod_sales_ac_id: DataTypes.INTEGER,
    sod_sales_sb_id: DataTypes.INTEGER,
    sod_sales_cc_id: DataTypes.INTEGER,
    sod_disc_ac_id: DataTypes.INTEGER,
    sod_um_conv: DataTypes.INTEGER,
    sod_qty_real: DataTypes.INTEGER,
    sod_taxable: DataTypes.STRING,
    sod_tax_inc: DataTypes.STRING,
    sod_tax_class: DataTypes.INTEGER,
    sod_status: DataTypes.STRING,
    sod_dt: DataTypes.DATE,
    sod_payment: DataTypes.INTEGER,
    sod_dp: DataTypes.INTEGER,
    sod_sales_unit: DataTypes.INTEGER,
    sod_loc_id: DataTypes.INTEGER,
    sod_serial: DataTypes.STRING,
    sod_qty_return: DataTypes.INTEGER,
    sod_ppn_type: DataTypes.STRING,
    sod_pod_oid: DataTypes.UUID,
    sod_qty_ir: DataTypes.INTEGER,
    sod_invc_oid: DataTypes.UUID,
    sod_invc_loc_id: DataTypes.INTEGER,
    sod_ppn: DataTypes.INTEGER,
    sod_pph: DataTypes.INTEGER,
    sod_sales_unit_total: DataTypes.INTEGER,
    sod_sqd_oid: DataTypes.UUID,
    sod_commision: DataTypes.INTEGER,
    sod_commision_total: DataTypes.INTEGER,
    sod_wo_status: DataTypes.STRING,
    sod_sod_parent_oid: DataTypes.UUID,
    sod_qty_child: DataTypes.INTEGER,
    sod_so_sq_ref_oid: DataTypes.UUID,
    sod_qty_open: DataTypes.INTEGER,
    sod_qty_booked: DataTypes.INTEGER,
    sq_invc_oid: DataTypes.UUID,
    sod_invc_qty: DataTypes.INTEGER,
    sqd_invc_oid: DataTypes.UUID,
    sod_part: DataTypes.STRING,
    sod_qty_checked: DataTypes.INTEGER,
    sod_locs_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName:'sod_det',
    timestamps: false,
    schema: 'public',
    modelName: 'SodDet',
  });
  return SodDet;
};