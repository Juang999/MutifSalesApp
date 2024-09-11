'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChartSales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cs_oid: {
        type: Sequelize.UUID
      },
      cs_userid: {
        type: Sequelize.BIGINT
      },
      cs_pt_id: {
        type: Sequelize.BIGINT
      },
      cs_pt_en_id: {
        type: Sequelize.BIGINT
      },
      cs_invc_oid: {
        type: Sequelize.UUID
      },
      cs_qty: {
        type: Sequelize.INTEGER
      },
      cs_created_at: {
        type: Sequelize.DATE
      },
      cs_updated_at: {
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
    await queryInterface.dropTable('ChartSales');
  }
};