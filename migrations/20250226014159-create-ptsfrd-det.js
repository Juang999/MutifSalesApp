'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtsfrdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptsfrd_oid: {
        type: Sequelize.UUID
      },
      ptsfrd_ptsfr_oid: {
        type: Sequelize.UUID
      },
      ptsfrd_seq: {
        type: Sequelize.INTEGER
      },
      ptsfrd_pt_id: {
        type: Sequelize.INTEGER
      },
      ptsfrd_qty: {
        type: Sequelize.INTEGER
      },
      ptsfrd_qty_receive: {
        type: Sequelize.INTEGER
      },
      ptsfrd_um: {
        type: Sequelize.INTEGER
      },
      ptsfrd_si_to_id: {
        type: Sequelize.INTEGER
      },
      ptsfrd_loc_to_id: {
        type: Sequelize.INTEGER
      },
      ptsfrd_lot_serial: {
        type: Sequelize.STRING
      },
      ptsfrd_cost: {
        type: Sequelize.INTEGER
      },
      _dt: {
        type: Sequelize.DATE
      },
      ptsfrd_pbd_oid: {
        type: Sequelize.UUID
      },
      ptsfrd_sqd_oid: {
        type: Sequelize.UUID
      },
      ptsfrd_sod_oid: {
        type: Sequelize.UUID
      },
      ptsfrd_pb_oid: {
        type: Sequelize.UUID
      },
      ptsfrd_pb_code: {
        type: Sequelize.STRING
      },
      ptsfrd_remarks: {
        type: Sequelize.STRING
      },
      ptsfrd_invc_oid: {
        type: Sequelize.UUID
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
    await queryInterface.dropTable('PtsfrdDets');
  }
};