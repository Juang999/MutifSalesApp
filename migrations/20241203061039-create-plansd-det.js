'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlansdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      plansd_oid: {
        type: Sequelize.UUID
      },
      plansd_plans_oid: {
        type: Sequelize.UUID
      },
      plansd_ptnr_id: {
        type: Sequelize.INTEGER
      },
      plansd_amount: {
        type: Sequelize.INTEGER
      },
      plansd_seq: {
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
    await queryInterface.dropTable('PlansdDets');
  }
};