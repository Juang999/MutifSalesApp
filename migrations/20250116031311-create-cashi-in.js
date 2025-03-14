'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CashiIns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cashi_oid: {
        type: Sequelize.UUID
      },
      cashi_dom_id: {
        type: Sequelize.INTEGER
      },
      cashi_en_id: {
        type: Sequelize.INTEGER
      },
      cashi_add_by: {
        type: Sequelize.STRING
      },
      cashi_add_date: {
        type: Sequelize.DATE
      },
      cashi_upd_by: {
        type: Sequelize.STRING
      },
      cashi_upd_date: {
        type: Sequelize.DATE
      },
      cashi_bk_id: {
        type: Sequelize.INTEGER
      },
      cashi_ptnr_id: {
        type: Sequelize.INTEGER
      },
      cashi_code: {
        type: Sequelize.STRING
      },
      cashi_date: {
        type: Sequelize.DATE
      },
      cashi_remarks: {
        type: Sequelize.STRING
      },
      cashi_reff: {
        type: Sequelize.STRING
      },
      cashi_amount: {
        type: Sequelize.INTEGER
      },
      cashi_check_number: {
        type: Sequelize.STRING
      },
      cashi_post_dated_check: {
        type: Sequelize.STRING
      },
      cashi_cu_id: {
        type: Sequelize.INTEGER
      },
      cashi_exc_rate: {
        type: Sequelize.INTEGER
      },
      cashi_is_reverse: {
        type: Sequelize.STRING
      },
      cashi_so_oid: {
        type: Sequelize.UUID
      },
      cashi_amount_used: {
        type: Sequelize.INTEGER
      },
      cashi_amount_remains: {
        type: Sequelize.INTEGER
      },
      cashi_reverse: {
        type: Sequelize.STRING
      },
      cashi_reff_oid: {
        type: Sequelize.UUID
      },
      cashi_reff_code: {
        type: Sequelize.STRING
      },
      cashi_close_temp: {
        type: Sequelize.STRING
      },
      cashi_invest_code: {
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
    await queryInterface.dropTable('CashiIns');
  }
};