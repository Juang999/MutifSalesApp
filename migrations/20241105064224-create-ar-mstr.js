'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ar_oid: {
        type: Sequelize.UUID
      },
      ar_dom_id: {
        type: Sequelize.INTEGER
      },
      ar_en_id: {
        type: Sequelize.INTEGER
      },
      ar_add_by: {
        type: Sequelize.STRING
      },
      ar_add_date: {
        type: Sequelize.DATE
      },
      ar_upd_by: {
        type: Sequelize.STRING
      },
      ar_upd_date: {
        type: Sequelize.DATE
      },
      ar_code: {
        type: Sequelize.STRING
      },
      ar_bill_to: {
        type: Sequelize.INTEGER
      },
      ar_cu_id: {
        type: Sequelize.INTEGER
      },
      ar_date: {
        type: Sequelize.DATE
      },
      ar_eff_date: {
        type: Sequelize.DATE
      },
      ar_amount: {
        type: Sequelize.INTEGER
      },
      ar_pay_amount: {
        type: Sequelize.INTEGER
      },
      ar_disc_date: {
        type: Sequelize.DATE
      },
      ar_due_date: {
        type: Sequelize.DATE
      },
      ar_expt_date: {
        type: Sequelize.DATE
      },
      ar_exc_rate: {
        type: Sequelize.DATE
      },
      ar_taxable: {
        type: Sequelize.STRING
      },
      ar_tax_class_id: {
        type: Sequelize.STRING
      },
      ar_ac_id: {
        type: Sequelize.STRING
      },
      ar_sb_id: {
        type: Sequelize.STRING
      },
      ar_cc_id: {
        type: Sequelize.STRING
      },
      ar_remarks: {
        type: Sequelize.STRING
      },
      ar_status: {
        type: Sequelize.STRING
      },
      ar_dt: {
        type: Sequelize.DATE
      },
      ar_type: {
        type: Sequelize.INTEGER
      },
      ar_credit_term: {
        type: Sequelize.INTEGER
      },
      ar_pay_prepaid: {
        type: Sequelize.INTEGER
      },
      ar_ac_prepaid: {
        type: Sequelize.INTEGER
      },
      ar_bk_id: {
        type: Sequelize.INTEGER
      },
      ar_terbilang: {
        type: Sequelize.STRING
      },
      ar_tax_inc: {
        type: Sequelize.STRING
      },
      ar_ppn_type: {
        type: Sequelize.STRING
      },
      ar_ti_in_use: {
        type: Sequelize.STRING
      },
      ar_shipping_charges: {
        type: Sequelize.INTEGER
      },
      ar_total_final: {
        type: Sequelize.INTEGER
      },
      ar_point: {
        type: Sequelize.INTEGER
      },
      ar_close_date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('ArMstrs');
  }
};