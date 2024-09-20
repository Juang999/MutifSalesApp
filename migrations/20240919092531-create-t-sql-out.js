'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TSqlOuts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sql_uid: {
        type: Sequelize.UUID
      },
      seq: {
        type: Sequelize.INTEGER
      },
      sql_command: {
        type: Sequelize.STRING
      },
      waktu: {
        type: Sequelize.DATE
      },
      mili_second: {
        type: Sequelize.INTEGER
      },
      status_process: {
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
    await queryInterface.dropTable('TSqlOuts');
  }
};