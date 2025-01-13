'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvcdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invcd_oid: {
        type: Sequelize.UUID
      },
      invcd_invc_oid: {
        type: Sequelize.UUID
      },
      invcd_dom_id: {
        type: Sequelize.INTEGER
      },
      invcd_en_id: {
        type: Sequelize.INTEGER
      },
      invcd_pt_id: {
        type: Sequelize.INTEGER
      },
      invcd_qty: {
        type: Sequelize.INTEGER
      },
      invcd_lot_serial: {
        type: Sequelize.STRING
      },
      invcd_qrbarcode: {
        type: Sequelize.STRING
      },
      invcd_loc_id: {
        type: Sequelize.INTEGER
      },
      invcd_locs_id: {
        type: Sequelize.INTEGER
      },
      invcd_um: {
        type: Sequelize.INTEGER
      },
      invcd_color_code: {
        type: Sequelize.STRING
      },
      invcd_weight: {
        type: Sequelize.INTEGER
      },
      invcd_trans_code: {
        type: Sequelize.STRING
      },
      invcd_remarks: {
        type: Sequelize.STRING
      },
      invcd_add_date: {
        type: Sequelize.DATE
      },
      invcd_add_by: {
        type: Sequelize.STRING
      },
      invcd_upd_date: {
        type: Sequelize.DATE
      },
      invcd_upd_by: {
        type: Sequelize.STRING
      },
      invcd_qty_old: {
        type: Sequelize.INTEGER
      },
      invcd_si_id: {
        type: Sequelize.DATE
      },
      invcd_is_verified: {
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
    await queryInterface.dropTable('InvcdDets');
  }
};