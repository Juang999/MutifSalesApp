'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvctTables', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invct_oid: {
        type: Sequelize.UUID
      },
      invct_dom_id: {
        type: Sequelize.INTEGER
      },
      invct_pt_id: {
        type: Sequelize.INTEGER
      },
      invct_date: {
        type: Sequelize.DATE
      },
      invct_qty: {
        type: Sequelize.INTEGER
      },
      invct_cost: {
        type: Sequelize.INTEGER
      },
      invct_lead: {
        type: Sequelize.INTEGER
      },
      invct_weight: {
        type: Sequelize.INTEGER
      },
      invct_en_id: {
        type: Sequelize.INTEGER
      },
      invct_si_id: {
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
    await queryInterface.dropTable('InvctTables');
  }
};