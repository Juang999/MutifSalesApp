'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RegPropMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      prop_oid: {
        type: Sequelize.UUID
      },
      prop_code: {
        type: Sequelize.STRING
      },
      prop_name: {
        type: Sequelize.STRING
      },
      prop_desc: {
        type: Sequelize.STRING
      },
      prop_active: {
        type: Sequelize.STRING
      },
      prop_add_by: {
        type: Sequelize.STRING
      },
      prop_add_date: {
        type: Sequelize.DATE
      },
      prop_upd_by: {
        type: Sequelize.STRING
      },
      prop_upd_date: {
        type: Sequelize.DATE
      },
      prop_id: {
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
    await queryInterface.dropTable('RegPropMstrs');
  }
};