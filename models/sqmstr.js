'use strict';
const {
  Model
} = require('sequelize');
const {
  v4: uuidv4
} = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class SqMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SqMstr.hasOne(models.SqdDet, {
        as: 'singular_detail_sales_quotation',
        sourceKey: 'sq_oid',
        foreignKey: 'sqd_sq_oid'
      })
    }
  }
  SqMstr.init({
    sq_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4()
    },
    sq_dom_id: DataTypes.INTEGER,
    sq_en_id: DataTypes.INTEGER,
    sq_add_by: DataTypes.STRING,
    sq_add_date: DataTypes.DATE,
    sq_upd_by: DataTypes.STRING,
    sq_upd_date: DataTypes.DATE,
    sq_code: DataTypes.STRING,
    sq_ptnr_id_sold: DataTypes.INTEGER,
    sq_ptnr_id_bill: DataTypes.INTEGER,
    sq_date: DataTypes.DATEONLY,
    sq_credit_term: DataTypes.INTEGER,
    sq_taxable: DataTypes.STRING,
    sq_tax_class: DataTypes.INTEGER,
    sq_si_id: DataTypes.INTEGER,
    sq_type: DataTypes.STRING,
    sq_sales_person: DataTypes.INTEGER,
    sq_pi_id: DataTypes.INTEGER,
    sq_pay_type: DataTypes.INTEGER,
    sq_pay_method: DataTypes.INTEGER,
    sq_dp: DataTypes.INTEGER,
    sq_disc_header: DataTypes.INTEGER,
    sq_total: DataTypes.INTEGER,
    sq_print_count: DataTypes.INTEGER,
    sq_due_date: DataTypes.DATEONLY,
    sq_close_date: DataTypes.DATEONLY,
    sq_tran_id: DataTypes.INTEGER,
    sq_trans_id: DataTypes.STRING,
    sq_trans_rmks: DataTypes.STRING,
    sq_current_route: DataTypes.STRING,
    sq_next_route: DataTypes.STRING,
    sq_dt: DataTypes.DATE,
    sq_bk_appr: DataTypes.STRING,
    sq_cu_id: DataTypes.INTEGER,
    sq_total_ppn: DataTypes.INTEGER,
    sq_total_pph: DataTypes.INTEGER,
    sq_payment: DataTypes.INTEGER,
    sq_exc_rate: DataTypes.INTEGER,
    sq_tax_inc: DataTypes.STRING,
    sq_cons: DataTypes.STRING,
    sq_terbilang: DataTypes.STRING,
    sq_bk_id: DataTypes.INTEGER,
    sq_interval: DataTypes.INTEGER,
    sq_ref_po_code: DataTypes.STRING,
    sq_ref_po_oid: DataTypes.UUID,
    sq_ppn_type: DataTypes.STRING,
    sq_ac_prepaid: DataTypes.INTEGER,
    sq_pay_prepaod: DataTypes.INTEGER,
    sq_ar_ac_id: DataTypes.INTEGER,
    sq_ar_sb_id: DataTypes.INTEGER,
    sq_ar_cc_id: DataTypes.INTEGER,
    sq_need_date: DataTypes.DATEONLY,
    sq_payment_date: DataTypes.DATEONLY,
    sq_last_transaction: DataTypes.DATEONLY,
    sq_is_package: DataTypes.STRING,
    sq_pt_id: DataTypes.INTEGER,
    sq_price: DataTypes.INTEGER,
    sq_sales_program: DataTypes.STRING,
    sq_status_produk: DataTypes.STRING,
    sq_diskon_produk: DataTypes.STRING,
    sq_unique_code: DataTypes.STRING,
    sq_dp_unique: DataTypes.STRING,
    sq_payment_unique: DataTypes.STRING,
    so_cons: DataTypes.STRING,
    sq_booking: DataTypes.STRING,
    sq_book_start_date: DataTypes.DATEONLY,
    sq_book_end_date: DataTypes.DATEONLY,
    sq_alocated: DataTypes.STRING,
    sq_book_status: DataTypes.STRING,
    sq_quo_type: DataTypes.INTEGER,
    sq_project: DataTypes.STRING,
    sq_shipping_charges: DataTypes.INTEGER,
    sq_total_final: DataTypes.INTEGER,
    sq_indent: DataTypes.STRING,
    sq_manufacture: DataTypes.STRING,
    sq_ptsfr_loc_id: DataTypes.INTEGER,
    sq_ptsfr_loc_to_id: DataTypes.INTEGER,
    sq_ptsfr_loc_git: DataTypes.INTEGER,
    sq_en_to_id: DataTypes.INTEGER,
    sq_si_to_id: DataTypes.INTEGER,
    sq_rebooking: DataTypes.STRING,
    sq_sq_ref_oid: DataTypes.UUID,
    sq_sq_ref_code: DataTypes.STRING,
    sq_dropshipper: DataTypes.STRING,
    sq_ship_to: DataTypes.STRING,
    sq_pi_area_id: DataTypes.INTEGER,
    sq_ds_ptnr_id: DataTypes.INTEGER,
    sq_dbg_ptnr_id: DataTypes.INTEGER,
    sq_dg_group: DataTypes.STRING,
    sq_ps_id: DataTypes.INTEGER,
    sq_midtrans_inv_number: DataTypes.STRING,
    sq_midtrans_inv_status: DataTypes.STRING,
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName:'sq_mstr',
    modelName: 'SqMstr',
  });
  return SqMstr;
};