'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SodDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sod_oid: {
        type: Sequelize.UUID
      },
      sod_dom_id: {
        type: Sequelize.INTEGER
      },
      sod_en_id: {
        type: Sequelize.INTEGER
      },
      sod_add_by: {
        type: Sequelize.STRING
      },
      sod_add_date: {
        type: Sequelize.DATE
      },
      sod_upd_by: {
        type: Sequelize.STRING
      },
      sod_upd_date: {
        type: Sequelize.DATE
      },
      sod_so_oid: {
        type: Sequelize.UUID
      },
      sod_seq: {
        type: Sequelize.INTEGER
      },
      sod_is_additional_charge: {
        type: Sequelize.STRING
      },
      sod_si_id: {
        type: Sequelize.INTEGER
      },
      sod_pt_id: {
        type: Sequelize.INTEGER
      },
      sod_rmks: {
        type: Sequelize.STRING
      },
      sod_qty: {
        type: Sequelize.INTEGER
      },
      sod_qty_allocated: {
        type: Sequelize.INTEGER
      },
      sod_qty_picked: {
        type: Sequelize.INTEGER
      },
      sod_qty_shipment: {
        type: Sequelize.INTEGER
      },
      sod_qty_pending_inv: {
        type: Sequelize.INTEGER
      },
      sod_qty_invoice: {
        type: Sequelize.INTEGER
      },
      sod_um: {
        type: Sequelize.INTEGER
      },
      sod_cost: {
        type: Sequelize.INTEGER
      },
      sod_price: {
        type: Sequelize.INTEGER
      },
      sod_disc: {
        type: Sequelize.INTEGER
      },
      sod_sales_ac_id: {
        type: Sequelize.INTEGER
      },
      sod_sales_sb_id: {
        type: Sequelize.INTEGER
      },
      sod_sales_cc_id: {
        type: Sequelize.INTEGER
      },
      sod_disc_ac_id: {
        type: Sequelize.INTEGER
      },
      sod_um_conv: {
        type: Sequelize.INTEGER
      },
      sod_qty_real: {
        type: Sequelize.INTEGER
      },
      sod_taxable: {
        type: Sequelize.STRING
      },
      sod_tax_inc: {
        type: Sequelize.STRING
      },
      sod_tax_class: {
        type: Sequelize.INTEGER
      },
      sod_status: {
        type: Sequelize.STRING
      },
      sod_dt: {
        type: Sequelize.DATE
      },
      sod_payment: {
        type: Sequelize.INTEGER
      },
      sod_dp: {
        type: Sequelize.INTEGER
      },
      sod_sales_unit: {
        type: Sequelize.INTEGER
      },
      sod_loc_id: {
        type: Sequelize.INTEGER
      },
      sod_serial: {
        type: Sequelize.STRING
      },
      sod_qty_return: {
        type: Sequelize.INTEGER
      },
      sod_ppn_type: {
        type: Sequelize.STRING
      },
      sod_pod_oid: {
        type: Sequelize.UUID
      },
      sod_qty_ir: {
        type: Sequelize.INTEGER
      },
      sod_invc_oid: {
        type: Sequelize.UUID
      },
      sod_invc_loc_id: {
        type: Sequelize.INTEGER
      },
      sod_ppn: {
        type: Sequelize.INTEGER
      },
      sod_pph: {
        type: Sequelize.INTEGER
      },
      sod_sales_unit_total: {
        type: Sequelize.INTEGER
      },
      sod_sqd_oid: {
        type: Sequelize.UUID
      },
      sod_commision: {
        type: Sequelize.INTEGER
      },
      sod_commision_total: {
        type: Sequelize.INTEGER
      },
      sod_wo_status: {
        type: Sequelize.STRING
      },
      sod_sod_parent_oid: {
        type: Sequelize.UUID
      },
      sod_qty_child: {
        type: Sequelize.INTEGER
      },
      sod_so_sq_ref_oid: {
        type: Sequelize.UUID
      },
      sod_qty_open: {
        type: Sequelize.INTEGER
      },
      sod_qty_booked: {
        type: Sequelize.INTEGER
      },
      sq_invc_oid: {
        type: Sequelize.UUID
      },
      sod_invc_qty: {
        type: Sequelize.INTEGER
      },
      sqd_invc_oid: {
        type: Sequelize.UUID
      },
      sod_part: {
        type: Sequelize.STRING
      },
      sod_qty_checked: {
        type: Sequelize.INTEGER
      },
      sod_locs_id: {
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
    await queryInterface.dropTable('SodDets');
  }
};