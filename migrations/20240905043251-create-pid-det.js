'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PidDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pid_oid: {
        type: Sequelize.UUID
      },
      pid_add_by: {
        type: Sequelize.STRING
      },
      pid_add_date: {
        type: Sequelize.DATE
      },
      pid_upd_date: {
        type: Sequelize.DATE
      },
      pid_upd_by: {
        type: Sequelize.STRING
      },
      pid_pi_oid: {
        type: Sequelize.UUID
      },
      pid_pt_id: {
        type: Sequelize.INTEGER
      },
      pid_dt: {
        type: Sequelize.DATE
      },
      pid_pt_tax_class: {
        type: Sequelize.INTEGER
      },
      pid_pt_ppn_type: {
        type: Sequelize.STRING
      },
      pid_pt_taxable: {
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
    await queryInterface.dropTable('PidDets');
  }
};