'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SqdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sqd_oid: {
        type: Sequelize.UUID
      },
      sqd_dom_id: {
        type: Sequelize.INTEGER
      },
      sqd_en_id: {
        type: Sequelize.INTEGER
      },
      sqd_add_by: {
        type: Sequelize.STRING
      },
      sqd_add_date: {
        type: Sequelize.DATE
      },
      sqd_upd_by: {
        type: Sequelize.STRING
      },
      sqd_upd_date: {
        type: Sequelize.DATE
      },
      sqd_sq_oid: {
        type: Sequelize.UUID
      },
      sqd_seq: {
        type: Sequelize.INTEGER
      },
      sqd_is_additional_charge: {
        type: Sequelize.STRING
      },
      sqd_si_id: {
        type: Sequelize.INTEGER
      },
      sqd_pt_id: {
        type: Sequelize.INTEGER
      },
      sqd_rmks: {
        type: Sequelize.STRING
      },
      sqd_qty: {
        type: Sequelize.INTEGER
      },
      sqd_qty_allocated: {
        type: Sequelize.INTEGER
      },
      sqd_qty_picked: {
        type: Sequelize.INTEGER
      },
      sqd_qty_shipment: {
        type: Sequelize.INTEGER
      },
      sqd_qty_pending_inv: {
        type: Sequelize.INTEGER
      },
      sqd_qty_invoice: {
        type: Sequelize.INTEGER
      },
      sqd_um: {
        type: Sequelize.INTEGER
      },
      sqd_cost: {
        type: Sequelize.INTEGER
      },
      sqd_price: {
        type: Sequelize.INTEGER
      },
      sqd_disc: {
        type: Sequelize.INTEGER
      },
      sqd_sales_ac_id: {
        type: Sequelize.INTEGER
      },
      sqd_sales_sb_id: {
        type: Sequelize.INTEGER
      },
      sqd_sales_cc_id: {
        type: Sequelize.INTEGER
      },
      sqd_disc_ac_id: {
        type: Sequelize.INTEGER
      },
      sqd_um_conv: {
        type: Sequelize.INTEGER
      },
      sqd_qty_real: {
        type: Sequelize.INTEGER
      },
      sqd_taxable: {
        type: Sequelize.STRING
      },
      sqd_tax_inc: {
        type: Sequelize.STRING
      },
      sqd_tax_class: {
        type: Sequelize.INTEGER
      },
      sqd_status: {
        type: Sequelize.STRING
      },
      sqd_dt: {
        type: Sequelize.DATE
      },
      sqd_payment: {
        type: Sequelize.INTEGER
      },
      sqd_dp: {
        type: Sequelize.INTEGER
      },
      sqd_sales_unit: {
        type: Sequelize.INTEGER
      },
      sqd_loc_id: {
        type: Sequelize.INTEGER
      },
      sqd_serial: {
        type: Sequelize.STRING
      },
      sqd_qty_return: {
        type: Sequelize.INTEGER
      },
      sqd_ppn_type: {
        type: Sequelize.STRING
      },
      sqd_pod_oid: {
        type: Sequelize.UUID
      },
      sqd_qty_ir: {
        type: Sequelize.INTEGER
      },
      sqd_invc_oid: {
        type: Sequelize.UUID
      },
      sqd_invc_loc_id: {
        type: Sequelize.INTEGER
      },
      sqd_need_date: {
        type: Sequelize.DATEONLY
      },
      sqd_qty_transfer_receipt: {
        type: Sequelize.INTEGER
      },
      sqd_qty_transfer_issue: {
        type: Sequelize.INTEGER
      },
      sqd_total_amount_price: {
        type: Sequelize.INTEGER
      },
      sbd_qty_riud: {
        type: Sequelize.INTEGER
      },
      sbd_qty_processed: {
        type: Sequelize.INTEGER
      },
      sbd_qty_completed: {
        type: Sequelize.INTEGER
      },
      sqd_qty_transfer: {
        type: Sequelize.INTEGER
      },
      sqd_qty_so: {
        type: Sequelize.INTEGER
      },
      sqd_qty_maxorder: {
        type: Sequelize.INTEGER
      },
      sqd_commision: {
        type: Sequelize.INTEGER
      },
      sqd_commision_total: {
        type: Sequelize.INTEGER
      },
      sqd_sales_unit_total: {
        type: Sequelize.INTEGER
      },
      sqd_sqd_oid: {
        type: Sequelize.UUID
      },
      sodas_sq_oid: {
        type: Sequelize.UUID
      },
      sqd_qty_booking: {
        type: Sequelize.INTEGER
      },
      sqd_qty_outs: {
        type: Sequelize.INTEGER
      },
      sq_dropshipper: {
        type: Sequelize.STRING
      },
      sqd_invc_qty: {
        type: Sequelize.INTEGER
      },
      sqd_ptnr_id: {
        type: Sequelize.INTEGER
      },
      sqd_locs_id: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('SqdDets');
  }
};