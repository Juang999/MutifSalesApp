'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SoMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      so_oid: {
        type: Sequelize.UUID
      },
      so_dom_id: {
        type: Sequelize.INTEGER
      },
      so_en_id: {
        type: Sequelize.INTEGER
      },
      so_add_by: {
        type: Sequelize.STRING
      },
      so_add_date: {
        type: Sequelize.DATE
      },
      so_upd_by: {
        type: Sequelize.STRING
      },
      so_upd_date: {
        type: Sequelize.DATE
      },
      so_code: {
        type: Sequelize.STRING
      },
      so_ptnr_id_sold: {
        type: Sequelize.INTEGER
      },
      so_ptnr_id_bill: {
        type: Sequelize.INTEGER
      },
      so_date: {
        type: Sequelize.DATE
      },
      so_credit_term: {
        type: Sequelize.STRING
      },
      so_taxable: {
        type: Sequelize.STRING
      },
      so_tax_class: {
        type: Sequelize.STRING
      },
      so_si_id: {
        type: Sequelize.INTEGER
      },
      so_type: {
        type: Sequelize.INTEGER
      },
      so_sales_person: {
        type: Sequelize.INTEGER
      },
      so_pi_id: {
        type: Sequelize.INTEGER
      },
      so_pay_type: {
        type: Sequelize.INTEGER
      },
      so_pay_method: {
        type: Sequelize.INTEGER
      },
      so_ar_ac_id: {
        type: Sequelize.INTEGER
      },
      so_ar_sb_id: {
        type: Sequelize.INTEGER
      },
      so_ar_cc_id: {
        type: Sequelize.INTEGER
      },
      so_dp: {
        type: Sequelize.INTEGER
      },
      so_disc_header: {
        type: Sequelize.INTEGER
      },
      so_total: {
        type: Sequelize.INTEGER
      },
      so_print_count: {
        type: Sequelize.INTEGER
      },
      so_payment_date: {
        type: Sequelize.DATE
      },
      so_close_date: {
        type: Sequelize.DATE
      },
      so_tran_id: {
        type: Sequelize.INTEGER
      },
      so_trans_id: {
        type: Sequelize.STRING
      },
      so_trans_rmks: {
        type: Sequelize.STRING
      },
      so_current_route: {
        type: Sequelize.STRING
      },
      so_next_route: {
        type: Sequelize.STRING
      },
      so_dt: {
        type: Sequelize.DATE
      },
      so_cu_id: {
        type: Sequelize.INTEGER
      },
      so_total_ppn: {
        type: Sequelize.INTEGER
      },
      so_total_pph: {
        type: Sequelize.INTEGER
      },
      so_payment: {
        type: Sequelize.INTEGER
      },
      so_exc_rate: {
        type: Sequelize.INTEGER
      },
      so_tax_inc: {
        type: Sequelize.STRING
      },
      so_cons: {
        type: Sequelize.STRING
      },
      so_terbilang: {
        type: Sequelize.STRING
      },
      so_bk_id: {
        type: Sequelize.INTEGER
      },
      so_interval: {
        type: Sequelize.INTEGER
      },
      so_ref_po_code: {
        type: Sequelize.STRING
      },
      so_ref_po_oid: {
        type: Sequelize.UUID
      },
      so_ppn_type: {
        type: Sequelize.STRING
      },
      so_is_package: {
        type: Sequelize.STRING
      },
      so_pt_id: {
        type: Sequelize.INTEGER
      },
      so_price: {
        type: Sequelize.INTEGER
      },
      so_manufacture: {
        type: Sequelize.STRING
      },
      so_sales_program: {
        type: Sequelize.STRING
      },
      so_ref_sq_oid: {
        type: Sequelize.UUID
      },
      so_ref_sq_code: {
        type: Sequelize.STRING
      },
      so_indent: {
        type: Sequelize.STRING
      },
      so_project: {
        type: Sequelize.STRING
      },
      so_shipping_charges: {
        type: Sequelize.INTEGER
      },
      so_total_final: {
        type: Sequelize.INTEGER
      },
      confa_accunt: {
        type: Sequelize.STRING
      },
      so_booking: {
        type: Sequelize.STRING
      },
      so_shipping_address: {
        type: Sequelize.STRING
      },
      so_sq_ref_oid: {
        type: Sequelize.UUID
      },
      so_sq_ref_code: {
        type: Sequelize.STRING
      },
      so_va: {
        type: Sequelize.STRING
      },
      so_psn_ref_code: {
        type: Sequelize.STRING
      },
      so_ref_po_code_2: {
        type: Sequelize.STRING
      },
      so_parent_oid: {
        type: Sequelize.UUID
      },
      so_parent_code: {
        type: Sequelize.STRING
      },
      so_ptsfr_loc_id: {
        type: Sequelize.INTEGER
      },
      so_ptsfr_loc_to_id: {
        type: Sequelize.INTEGER
      },
      so_ptsfr_loc_git: {
        type: Sequelize.INTEGER
      },
      so_alocated: {
        type: Sequelize.STRING
      },
      so_book_start_date: {
        type: Sequelize.DATE
      },
      so_book_end_date: {
        type: Sequelize.DATE
      },
      so_print_dt: {
        type: Sequelize.DATE
      },
      so_print: {
        type: Sequelize.STRING
      },
      so_return: {
        type: Sequelize.STRING
      },
      sqd_invc_oid: {
        type: Sequelize.UUID
      },
      so_wo_status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SoMstrs');
  }
};