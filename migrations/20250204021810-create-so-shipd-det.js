'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SoShipdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      soshipd_oid: {
        type: Sequelize.UUID
      },
      soshipd_soship_oid: {
        type: Sequelize.UUID
      },
      soshipd_sod_oid: {
        type: Sequelize.UUID
      },
      soshipd_seq: {
        type: Sequelize.INTEGER
      },
      soshipd_qty: {
        type: Sequelize.INTEGER
      },
      soshipd_um: {
        type: Sequelize.INTEGER
      },
      soshipd_um_conv: {
        type: Sequelize.INTEGER
      },
      soshipd_cancel_bo: {
        type: Sequelize.STRING
      },
      soshipd_qty_real: {
        type: Sequelize.INTEGER
      },
      soshipd_si_id: {
        type: Sequelize.INTEGER
      },
      soshipd_loc_id: {
        type: Sequelize.INTEGER
      },
      soshipd_lot_serial: {
        type: Sequelize.STRING
      },
      soshipd_rea_code_id: {
        type: Sequelize.INTEGER
      },
      soshipd_dt: {
        type: Sequelize.DATE
      },
      soshipd_qty_inv: {
        type: Sequelize.INTEGER
      },
      soshipd_close_line: {
        type: Sequelize.STRING
      },
      soshipd_qty_allocated: {
        type: Sequelize.INTEGER
      },
      soshipd_qty_booked: {
        type: Sequelize.INTEGER
      },
      soshipd_sqd_oid: {
        type: Sequelize.UUID
      },
      soshipd_part: {
        type: Sequelize.STRING
      },
      soshipd_qty_cheked: {
        type: Sequelize.INTEGER
      },
      soshipd_en_id: {
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
    await queryInterface.dropTable('SoShipdDets');
  }
};