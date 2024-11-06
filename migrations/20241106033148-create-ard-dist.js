'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ArdDists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ard_oid: {
        type: Sequelize.UUID
      },
      ard_ar_oid: {
        type: Sequelize.UUID
      },
      ard_tax_distribution: {
        type: Sequelize.STRING
      },
      ard_taxable: {
        type: Sequelize.STRING
      },
      ard_tax_class_id: {
        type: Sequelize.INTEGER
      },
      ard_ac_id: {
        type: Sequelize.INTEGER
      },
      ard_sb_id: {
        type: Sequelize.INTEGER
      },
      ard_cc_id: {
        type: Sequelize.INTEGER
      },
      ard_amount: {
        type: Sequelize.INTEGER
      },
      ard_remarks: {
        type: Sequelize.STRING
      },
      ard_dt: {
        type: Sequelize.DATE
      },
      ard_tax_inc: {
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
    await queryInterface.dropTable('ArdDists');
  }
};