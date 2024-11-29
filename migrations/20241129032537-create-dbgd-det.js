'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DbgdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dbgd_oid: {
        type: Sequelize.UUID
      },
      dbgd_dbg_oid: {
        type: Sequelize.UUID
      },
      dbgd_en_id: {
        type: Sequelize.INTEGER
      },
      dbgd_ptnr_id: {
        type: Sequelize.INTEGER
      },
      dbgd_dbg_id: {
        type: Sequelize.INTEGER
      },
      dbgd_parent_id: {
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
    await queryInterface.dropTable('DbgdDets');
  }
};