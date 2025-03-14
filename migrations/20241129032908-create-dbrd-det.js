'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DbrdDets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dbrd_oid: {
        type: Sequelize.UUID
      },
      dbrd_dbr_oid: {
        type: Sequelize.UUID
      },
      dbrd_seq: {
        type: Sequelize.INTEGER
      },
      dbrd_en_id: {
        type: Sequelize.INTEGER
      },
      dbrd_en_desc: {
        type: Sequelize.STRING
      },
      dbrd_ar_oid: {
        type: Sequelize.UUID
      },
      dbrd_ar_eff_date: {
        type: Sequelize.DATE
      },
      dbrd_ar_date: {
        type: Sequelize.DATE
      },
      dbrd_ar_code: {
        type: Sequelize.STRING
      },
      dbrd_ars_invoice: {
        type: Sequelize.INTEGER
      },
      dbrd_ar_final: {
        type: Sequelize.INTEGER
      },
      dbrd_so_amount: {
        type: Sequelize.INTEGER
      },
      dbrd_so_point: {
        type: Sequelize.INTEGER
      },
      dbrd_ar_amount: {
        type: Sequelize.INTEGER
      },
      dbrd_ret_amount: {
        type: Sequelize.INTEGER
      },
      dbrd_drcr_tot: {
        type: Sequelize.INTEGER
      },
      dbrd_point: {
        type: Sequelize.INTEGER
      },
      dbrd_ar_duedate: {
        type: Sequelize.DATE
      },
      dbrd_arpayd_date: {
        type: Sequelize.DATE
      },
      dbrd_ar_close_date: {
        type: Sequelize.DATE
      },
      dbrd_arpay_code: {
        type: Sequelize.STRING
      },
      dbrd_apyad_amount: {
        type: Sequelize.INTEGER
      },
      dbrd_tot_point: {
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
    await queryInterface.dropTable('DbrdDets');
  }
};