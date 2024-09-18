'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RegKelMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kel_oid: {
        type: Sequelize.UUID
      },
      kel_kec_id: {
        type: Sequelize.INTEGER
      },
      kel_kec_code: {
        type: Sequelize.STRING
      },
      kel_id: {
        type: Sequelize.INTEGER
      },
      kel_code: {
        type: Sequelize.STRING
      },
      kel_name: {
        type: Sequelize.STRING
      },
      kel_desc: {
        type: Sequelize.STRING
      },
      kel_active: {
        type: Sequelize.STRING
      },
      kel_add_by: {
        type: Sequelize.STRING
      },
      kel_add_date: {
        type: Sequelize.DATE
      },
      kel_upd_by: {
        type: Sequelize.STRING
      },
      kel_upd_date: {
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
    await queryInterface.dropTable('RegKelMstrs');
  }
};