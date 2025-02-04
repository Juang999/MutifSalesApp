'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SoShipMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      soship_oid: {
        type: Sequelize.UUID
      },
      soship_dom_id: {
        type: Sequelize.INTEGER
      },
      soship_en_id: {
        type: Sequelize.INTEGER
      },
      soship_add_by: {
        type: Sequelize.STRING
      },
      soship_add_date: {
        type: Sequelize.DATE
      },
      soship_upd_by: {
        type: Sequelize.STRING
      },
      soship_upd_date: {
        type: Sequelize.DATE
      },
      soship_code: {
        type: Sequelize.STRING
      },
      soship_date: {
        type: Sequelize.DATE
      },
      soship_so_oid: {
        type: Sequelize.UUID
      },
      soship_si_id: {
        type: Sequelize.INTEGER
      },
      soship_is_shipment: {
        type: Sequelize.INTEGER
      },
      soship_dt: {
        type: Sequelize.DATEONLY
      },
      soship_exc_rate: {
        type: Sequelize.INTEGER
      },
      soship_cu_id: {
        type: Sequelize.INTEGER
      },
      soship_ti_in_use: {
        type: Sequelize.STRING
      },
      soship_remarks: {
        type: Sequelize.STRING
      },
      soship_print_dt: {
        type: Sequelize.DATE
      },
      soship_print: {
        type: Sequelize.STRING
      },
      soship_booking: {
        type: Sequelize.STRING
      },
      soship_cons: {
        type: Sequelize.STRING
      },
      soship_alocated: {
        type: Sequelize.STRING
      },
      soship_pcs_oid: {
        type: Sequelize.UUID
      },
      soship_pcs_code: {
        type: Sequelize.STRING
      },
      soship_accepted: {
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
    await queryInterface.dropTable('SoShipMstrs');
  }
};