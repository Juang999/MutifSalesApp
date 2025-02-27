'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TransStatuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trans_oid: {
        type: Sequelize.UUID
      },
      trans_id: {
        type: Sequelize.INTEGER
      },
      trans_desc: {
        type: Sequelize.STRING
      },
      trans_wf_start: {
        type: Sequelize.STRING
      },
      trans_dt: {
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
    await queryInterface.dropTable('TransStatuses');
  }
};