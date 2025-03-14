'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RegKecMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kec_oid: {
        type: Sequelize.UUID
      },
      kec_kota_id: {
        type: Sequelize.INTEGER
      },
      kec_kota_code: {
        type: Sequelize.STRING
      },
      kec_id: {
        type: Sequelize.INTEGER
      },
      kec_code: {
        type: Sequelize.STRING
      },
      kec_name: {
        type: Sequelize.STRING
      },
      kec_desc: {
        type: Sequelize.STRING
      },
      kec_active: {
        type: Sequelize.STRING
      },
      kec_add_by: {
        type: Sequelize.STRING
      },
      kec_add_date: {
        type: Sequelize.DATE
      },
      kec_upd_by: {
        type: Sequelize.STRING
      },
      kec_upd_date: {
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
    await queryInterface.dropTable('RegKecMstrs');
  }
};