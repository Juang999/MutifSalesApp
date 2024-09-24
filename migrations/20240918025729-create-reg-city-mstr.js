'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RegCityMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kota_oid: {
        type: Sequelize.UUID
      },
      kota_prop_id: {
        type: Sequelize.INTEGER
      },
      kota_prop_kode: {
        type: Sequelize.STRING
      },
      kota_id: {
        type: Sequelize.INTEGER
      },
      kota_code: {
        type: Sequelize.STRING
      },
      kota_name: {
        type: Sequelize.STRING
      },
      kota_active: {
        type: Sequelize.STRING
      },
      kota_add_by: {
        type: Sequelize.STRING
      },
      kota_add_date: {
        type: Sequelize.DATE
      },
      kota_upd_by: {
        type: Sequelize.STRING
      },
      kota_upd_date: {
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
    await queryInterface.dropTable('RegCityMstrs');
  }
};