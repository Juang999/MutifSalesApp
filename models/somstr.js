'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
const {Op} = require('sequelize');

const startMonth = moment().startOf('months').format('YYYY-MM-DD 00:00:00');
const endMonth = moment().endOf('months').format('YYYY-MM-DD 23:59:59');

module.exports = (sequelize, DataTypes) => {
  class SoMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SoMstr.hasMany(models.SodDet, {
        as: 'detail_sales_order',
        sourceKey: 'so_oid',
        foreignKey: 'sod_so_oid'
      })

      SoMstr.belongsTo(models.PtnrMstr, {
        as: 'sold_to',
        targetKey: 'ptnr_id',
        foreignKey: 'so_ptnr_id_sold'
      })

      SoMstr.belongsTo(models.PtnrMstr, {
        as: 'sales_person',
        targetKey: 'ptnr_id',
        foreignKey: 'so_sales_person'
      })

      SoMstr.belongsTo(models.EnMstr, {
        as: 'entity_so',
        targetKey: 'en_id',
        foreignKey: 'so_en_id'
      })
    }
  }
  SoMstr.init({
    so_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    so_dom_id: DataTypes.INTEGER,
    so_en_id: DataTypes.INTEGER,
    so_add_by: DataTypes.STRING,
    so_add_date: DataTypes.DATE,
    so_upd_by: DataTypes.STRING,
    so_upd_date: DataTypes.DATE,
    so_code: DataTypes.STRING,
    so_ptnr_id_sold: DataTypes.INTEGER,
    so_ptnr_id_bill: DataTypes.INTEGER,
    so_date: DataTypes.DATE,
    so_credit_term: DataTypes.STRING,
    so_taxable: DataTypes.STRING,
    so_tax_class: DataTypes.STRING,
    so_si_id: DataTypes.INTEGER,
    so_type: DataTypes.INTEGER,
    so_sales_person: DataTypes.INTEGER,
    so_pi_id: DataTypes.INTEGER,
    so_pay_type: DataTypes.INTEGER,
    so_pay_method: DataTypes.INTEGER,
    so_ar_ac_id: DataTypes.INTEGER,
    so_ar_sb_id: DataTypes.INTEGER,
    so_ar_cc_id: DataTypes.INTEGER,
    so_dp: DataTypes.INTEGER,
    so_disc_header: DataTypes.INTEGER,
    so_total: DataTypes.INTEGER,
    so_print_count: DataTypes.INTEGER,
    so_payment_date: DataTypes.DATE,
    so_close_date: DataTypes.DATE,
    so_tran_id: DataTypes.INTEGER,
    so_trans_id: DataTypes.STRING,
    so_trans_rmks: DataTypes.STRING,
    so_current_route: DataTypes.STRING,
    so_next_route: DataTypes.STRING,
    so_dt: DataTypes.DATE,
    so_cu_id: DataTypes.INTEGER,
    so_total_ppn: DataTypes.INTEGER,
    so_total_pph: DataTypes.INTEGER,
    so_payment: DataTypes.INTEGER,
    so_exc_rate: DataTypes.INTEGER,
    so_tax_inc: DataTypes.STRING,
    so_cons: DataTypes.STRING,
    so_terbilang: DataTypes.STRING,
    so_bk_id: DataTypes.INTEGER,
    so_interval: DataTypes.INTEGER,
    so_ref_po_code: DataTypes.STRING,
    so_ref_po_oid: DataTypes.UUID,
    so_ppn_type: DataTypes.STRING,
    so_is_package: DataTypes.STRING,
    so_pt_id: DataTypes.INTEGER,
    so_price: DataTypes.INTEGER,
    so_manufacture: DataTypes.STRING,
    so_sales_program: DataTypes.STRING,
    so_ref_sq_oid: DataTypes.UUID,
    so_ref_sq_code: DataTypes.STRING,
    so_indent: DataTypes.STRING,
    so_project: DataTypes.STRING,
    so_shipping_charges: DataTypes.INTEGER,
    so_total_final: DataTypes.INTEGER,
    confa_accunt: DataTypes.STRING,
    so_booking: DataTypes.STRING,
    so_shipping_address: DataTypes.STRING,
    so_sq_ref_oid: DataTypes.UUID,
    so_sq_ref_code: DataTypes.STRING,
    so_va: DataTypes.STRING,
    so_psn_ref_code: DataTypes.STRING,
    so_ref_po_code_2: DataTypes.STRING,
    so_parent_oid: DataTypes.UUID,
    so_parent_code: DataTypes.STRING,
    so_ptsfr_loc_id: DataTypes.INTEGER,
    so_ptsfr_loc_to_id: DataTypes.INTEGER,
    so_ptsfr_loc_git: DataTypes.INTEGER,
    so_alocated: DataTypes.STRING,
    so_book_start_date: DataTypes.DATE,
    so_book_end_date: DataTypes.DATE,
    so_print_dt: DataTypes.DATE,
    so_print: DataTypes.STRING,
    so_return: DataTypes.STRING,
    sqd_invc_oid: DataTypes.UUID,
    so_wo_status: DataTypes.STRING
  }, {
    sequelize,
    scopes: {
      oneMonth: {
        where: {
          so_add_date: {
            [Op.between]: [startMonth, endMonth]
          }
        }
      }
    },
    tableName:'so_mstr',
    timestamps: false,
    schema: 'public',
    modelName: 'SoMstr',
  });
  return SoMstr;
};