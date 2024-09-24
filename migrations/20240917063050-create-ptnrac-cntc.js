'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtnracCntcs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptnrac_oid: {
        type: Sequelize.UUID
      },
      addrc_ptnra_oid: {
        type: Sequelize.UUID
      },
      ptnrac_add_by: {
        type: Sequelize.STRING
      },
      ptnrac_add_date: {
        type: Sequelize.DATE
      },
      ptnrac_seq: {
        type: Sequelize.INTEGER
      },
      ptnrac_function: {
        type: Sequelize.INTEGER
      },
      ptnrac_contact_name: {
        type: Sequelize.STRING
      },
      ptnrac_phone_1: {
        type: Sequelize.STRING
      },
      ptnrac_phone_2: {
        type: Sequelize.STRING
      },
      ptnrac_email: {
        type: Sequelize.STRING
      },
      ptnrac_dt: {
        type: Sequelize.DATE
      },
      ptnrac_upd_by: {
        type: Sequelize.STRING
      },
      ptnrac_upd_date: {
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
    await queryInterface.dropTable('PtnracCntcs');
  }
};