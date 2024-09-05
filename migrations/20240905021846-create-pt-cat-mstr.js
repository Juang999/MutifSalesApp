'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtCatMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptcat_oid: {
        type: Sequelize.UUID
      },
      ptcat_code: {
        type: Sequelize.STRING
      },
      ptcat_group_id: {
        type: Sequelize.INTEGER
      },
      ptcat_id: {
        type: Sequelize.INTEGER
      },
      ptcat_desc: {
        type: Sequelize.STRING
      },
      ptcat_active: {
        type: Sequelize.STRING
      },
      ptcat_add_by: {
        type: Sequelize.STRING
      },
      ptcat_add_date: {
        type: Sequelize.DATE
      },
      ptcat_upd_by: {
        type: Sequelize.STRING
      },
      ptcat_upd_date: {
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
    await queryInterface.dropTable('PtCatMstrs');
  }
};