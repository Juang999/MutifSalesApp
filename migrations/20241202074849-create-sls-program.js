'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SlsPrograms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sls_oid: {
        type: Sequelize.UUID
      },
      sls_id: {
        type: Sequelize.INTEGER
      },
      sls_code: {
        type: Sequelize.STRING
      },
      sls_name: {
        type: Sequelize.STRING
      },
      sls_desc: {
        type: Sequelize.STRING
      },
      sls_active: {
        type: Sequelize.STRING
      },
      sls_add_by: {
        type: Sequelize.STRING
      },
      sls_add_date: {
        type: Sequelize.DATE
      },
      sls_upd_by: {
        type: Sequelize.STRING
      },
      sls_upd_date: {
        type: Sequelize.DATE
      },
      sls_dt: {
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
    await queryInterface.dropTable('SlsPrograms');
  }
};