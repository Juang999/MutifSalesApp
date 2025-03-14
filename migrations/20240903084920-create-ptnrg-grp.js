'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtnrgGrps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptnrg_oid: {
        type: Sequelize.UUID
      },
      ptnrg_dom_id: {
        type: Sequelize.INTEGER
      },
      ptnrg_en_id: {
        type: Sequelize.INTEGER
      },
      ptnrg_id: {
        type: Sequelize.INTEGER
      },
      ptnrg_add_by: {
        type: Sequelize.STRING
      },
      ptnrg_add_date: {
        type: Sequelize.DATE
      },
      ptnrg_upd_by: {
        type: Sequelize.STRING
      },
      ptnrg_upd_date: {
        type: Sequelize.DATE
      },
      ptnrg_code: {
        type: Sequelize.STRING
      },
      ptnrg_name: {
        type: Sequelize.STRING
      },
      ptnrg_desc: {
        type: Sequelize.STRING
      },
      ptnrg_active: {
        type: Sequelize.STRING
      },
      ptnrg_dt: {
        type: Sequelize.DATE
      },
      ptnrg_payment_methode: {
        type: Sequelize.INTEGER
      },
      ptnrg_credit_term: {
        type: Sequelize.INTEGER
      },
      ptnrg_limit_credit: {
        type: Sequelize.INTEGER
      },
      ptnrg_ap_ac_id: {
        type: Sequelize.INTEGER
      },
      ptnrg_ar_ac_id: {
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
    await queryInterface.dropTable('PtnrgGrps');
  }
};