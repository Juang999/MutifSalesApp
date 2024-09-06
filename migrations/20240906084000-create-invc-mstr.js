'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvcMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invc_oid: {
        type: Sequelize.UUID
      },
      invc_dom_id: {
        type: Sequelize.INTEGER
      },
      invc_en_id: {
        type: Sequelize.INTEGER
      },
      invc_si_id: {
        type: Sequelize.INTEGER
      },
      invc_loc_id: {
        type: Sequelize.INTEGER
      },
      invc_pt_id: {
        type: Sequelize.INTEGER
      },
      invc_qty_available: {
        type: Sequelize.INTEGER
      },
      invc_qty_booked: {
        type: Sequelize.INTEGER
      },
      invc_qty: {
        type: Sequelize.INTEGER
      },
      invc_qty_old: {
        type: Sequelize.INTEGER
      },
      invc_serial: {
        type: Sequelize.STRING
      },
      pt_tax_class: {
        type: Sequelize.STRING
      },
      invc_qty_alloc: {
        type: Sequelize.INTEGER
      },
      invc_sq_booking: {
        type: Sequelize.STRING
      },
      invc_last_booked: {
        type: Sequelize.DATEONLY
      },
      invc_total: {
        type: Sequelize.INTEGER
      },
      invc_qty_booking: {
        type: Sequelize.INTEGER
      },
      invc_shwn_id: {
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
    await queryInterface.dropTable('InvcMstrs');
  }
};