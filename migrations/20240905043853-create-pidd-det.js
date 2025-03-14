'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PiddDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pidd_oid: {
        type: Sequelize.UUID
      },
      pidd_add_by: {
        type: Sequelize.STRING
      },
      pidd_add_date: {
        type: Sequelize.DATE
      },
      pidd_upd_date: {
        type: Sequelize.DATE
      },
      pidd_upd_by: {
        type: Sequelize.STRING
      },
      pidd_pid_oid: {
        type: Sequelize.UUID
      },
      pidd_payment_type: {
        type: Sequelize.INTEGER
      },
      pidd_area_id: {
        type: Sequelize.INTEGER
      },
      pidd_price: {
        type: Sequelize.INTEGER
      },
      pidd_disc: {
        type: Sequelize.INTEGER
      },
      pidd_dp: {
        type: Sequelize.INTEGER
      },
      pidd_interval: {
        type: Sequelize.INTEGER
      },
      pidd_payment: {
        type: Sequelize.INTEGER
      },
      pidd_min_qty: {
        type: Sequelize.INTEGER
      },
      pidd_sales_unit: {
        type: Sequelize.INTEGER
      },
      pidd_dt: {
        type: Sequelize.DATE
      },
      pidd_commision: {
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
    await queryInterface.dropTable('PiddDets');
  }
};