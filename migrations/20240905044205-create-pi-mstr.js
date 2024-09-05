'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PiMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pi_oid: {
        type: Sequelize.UUID
      },
      pi_dom_id: {
        type: Sequelize.INTEGER
      },
      pi_en_id: {
        type: Sequelize.INTEGER
      },
      pi_add_by: {
        type: Sequelize.STRING
      },
      pi_add_date: {
        type: Sequelize.DATE
      },
      pi_upd_by: {
        type: Sequelize.STRING
      },
      pi_upd_date: {
        type: Sequelize.DATE
      },
      pi_id: {
        type: Sequelize.INTEGER
      },
      pi_code: {
        type: Sequelize.STRING
      },
      pi_desc: {
        type: Sequelize.STRING
      },
      pi_so_type: {
        type: Sequelize.STRING
      },
      pi_promo_id: {
        type: Sequelize.INTEGER
      },
      pi_cu_id: {
        type: Sequelize.INTEGER
      },
      pi_sales_program: {
        type: Sequelize.INTEGER
      },
      pi_start_date: {
        type: Sequelize.DATE
      },
      pi_end_date: {
        type: Sequelize.DATE
      },
      pi_active: {
        type: Sequelize.STRING
      },
      pi_dt: {
        type: Sequelize.DATE
      },
      pi_ptnrg_id: {
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
    await queryInterface.dropTable('PiMstrs');
  }
};