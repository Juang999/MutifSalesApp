'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DbgGroups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dbg_oid: {
        type: Sequelize.UUID
      },
      dbg_code: {
        type: Sequelize.STRING
      },
      dbg_name: {
        type: Sequelize.STRING
      },
      dbg_city_id: {
        type: Sequelize.INTEGER
      },
      dbg_remarks: {
        type: Sequelize.STRING
      },
      dbg_add_by: {
        type: Sequelize.STRING
      },
      dbg_add_date: {
        type: Sequelize.DATE
      },
      dbg_upd_by: {
        type: Sequelize.STRING
      },
      dbg_upd_date: {
        type: Sequelize.DATE
      },
      dbg_desc: {
        type: Sequelize.STRING
      },
      dbg_ptnrg_id: {
        type: Sequelize.INTEGER
      },
      dbg_id: {
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
    await queryInterface.dropTable('DbgGroups');
  }
};