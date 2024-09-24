'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RegCountryMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country_oid: {
        type: Sequelize.UUID
      },
      country_id: {
        type: Sequelize.INTEGER
      },
      country_code: {
        type: Sequelize.STRING
      },
      country_name: {
        type: Sequelize.STRING
      },
      country_active: {
        type: Sequelize.STRING
      },
      country_add_by: {
        type: Sequelize.STRING
      },
      country_add_date: {
        type: Sequelize.DATE
      },
      country_upd_by: {
        type: Sequelize.STRING
      },
      country_upd_date: {
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
    await queryInterface.dropTable('RegCountryMstrs');
  }
};