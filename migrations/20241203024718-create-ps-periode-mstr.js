'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PsPeriodeMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      periode_oid: {
        type: Sequelize.UUID
      },
      periode_code: {
        type: Sequelize.STRING
      },
      periode_start_date: {
        type: Sequelize.DATEONLY
      },
      periode_end_date: {
        type: Sequelize.DATEONLY
      },
      periode_active: {
        type: Sequelize.STRING
      },
      periode_add_by: {
        type: Sequelize.STRING
      },
      periode_add_date: {
        type: Sequelize.DATE
      },
      periode_upd_by: {
        type: Sequelize.STRING
      },
      periode_upd_date: {
        type: Sequelize.DATE
      },
      periode_id: {
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
    await queryInterface.dropTable('PsPeriodeMstrs');
  }
};