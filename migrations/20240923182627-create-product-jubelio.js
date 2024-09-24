'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductJubelios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pj_oid: {
        type: Sequelize.UUID
      },
      pj_item_id: {
        type: Sequelize.INTEGER
      },
      pj_item_code: {
        type: Sequelize.STRING
      },
      pj_item_name: {
        type: Sequelize.STRING
      },
      pj_available_qty: {
        type: Sequelize.INTEGER
      },
      pj_buy_price: {
        type: Sequelize.INTEGER
      },
      pj_is_consignment: {
        type: Sequelize.BOOLEAN
      },
      pj_buy_unit: {
        type: Sequelize.STRING
      },
      pj_account_code: {
        type: Sequelize.STRING
      },
      pj_account_name: {
        type: Sequelize.STRING
      },
      pj_uom_id: {
        type: Sequelize.INTEGER
      },
      pj_invt_acct_id: {
        type: Sequelize.INTEGER
      },
      pj_brand_name: {
        type: Sequelize.STRING
      },
      pj_item_full_name: {
        type: Sequelize.STRING
      },
      pj_use_serial_number: {
        type: Sequelize.BOOLEAN
      },
      pj_use_batch_number: {
        type: Sequelize.BOOLEAN
      },
      pj_coalesce: {
        type: Sequelize.INTEGER
      },
      pj_average_cost: {
        type: Sequelize.INTEGER
      },
      pj_end_qty: {
        type: Sequelize.INTEGER
      },
      pj_order_qty: {
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
    await queryInterface.dropTable('ProductJubelios');
  }
};