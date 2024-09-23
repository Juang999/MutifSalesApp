'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TConfSettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      create_jurnal: {
        type: Sequelize.BOOLEAN
      },
      server_code: {
        type: Sequelize.STRING
      },
      xmpp_name: {
        type: Sequelize.STRING
      },
      xmpp_ip: {
        type: Sequelize.STRING
      },
      http_foto: {
        type: Sequelize.STRING
      },
      version_code: {
        type: Sequelize.STRING
      },
      version_id: {
        type: Sequelize.STRING
      },
      serv_code: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('TConfSettings');
  }
};