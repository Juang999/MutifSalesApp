'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtsfrMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptsfr_oid: {
        type: Sequelize.UUID
      },
      ptsfr_dom_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_en_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_add_by: {
        type: Sequelize.STRING
      },
      ptsfr_add_date: {
        type: Sequelize.DATE
      },
      ptsfr_upd_by: {
        type: Sequelize.STRING
      },
      ptsfr_upd_date: {
        type: Sequelize.DATE
      },
      ptsfr_en_to_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_code: {
        type: Sequelize.STRING
      },
      ptsfr_date: {
        type: Sequelize.DATEONLY
      },
      ptsfr_receive_date: {
        type: Sequelize.DATEONLY
      },
      ptsfr_si_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_loc_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_loc_git: {
        type: Sequelize.INTEGER
      },
      ptsfr_remarks: {
        type: Sequelize.STRING
      },
      ptsfr_trans_id: {
        type: Sequelize.STRING
      },
      ptsfr_dt: {
        type: Sequelize.DATE
      },
      ptsfr_loc_to_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_si_to_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_pb_oid: {
        type: Sequelize.UUID
      },
      ptsfr_so_oid: {
        type: Sequelize.UUID
      },
      pt_tax_class: {
        type: Sequelize.STRING
      },
      ptsfr_tran_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_sq_oid: {
        type: Sequelize.UUID
      },
      ptsfr_is_transfer: {
        type: Sequelize.STRING
      },
      ptsfr_auto_receipts: {
        type: Sequelize.STRING
      },
      ptsfr_booking: {
        type: Sequelize.STRING
      },
      ptsfr_cons: {
        type: Sequelize.STRING
      },
      ptsfr_sq_ptnr_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_sq_dbg_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_ds_ptnr_id: {
        type: Sequelize.INTEGER
      },
      ptsfr_dropship: {
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
    await queryInterface.dropTable('PtsfrMstrs');
  }
};