'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PlansMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      plans_oid: {
        type: Sequelize.UUID
      },
      plans_code: {
        type: Sequelize.STRING
      },
      plans_date: {
        type: Sequelize.DATEONLY
      },
      plans_periode: {
        type: Sequelize.STRING
      },
      plans_sales_id: {
        type: Sequelize.INTEGER
      },
      plans_add_by: {
        type: Sequelize.STRING
      },
      plans_add_date: {
        type: Sequelize.DATE
      },
      plans_upd_by: {
        type: Sequelize.STRING
      },
      plans_upd_date: {
        type: Sequelize.DATE
      },
      plans_amount_total: {
        type: Sequelize.INTEGER
      },
      plans_dom_id: {
        type: Sequelize.INTEGER
      },
      plans_en_id: {
        type: Sequelize.INTEGER
      },
      plans_remarks: {
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
    await queryInterface.dropTable('PlansMstrs');
  }
};