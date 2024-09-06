'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EnMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      en_oid: {
        type: Sequelize.UUID
      },
      en_dom_id: {
        type: Sequelize.INTEGER
      },
      en_add_by: {
        type: Sequelize.STRING
      },
      en_add_date: {
        type: Sequelize.DATE
      },
      en_upd_by: {
        type: Sequelize.STRING
      },
      en_upd_date: {
        type: Sequelize.DATE
      },
      en_id: {
        type: Sequelize.INTEGER
      },
      en_code: {
        type: Sequelize.STRING
      },
      en_desc: {
        type: Sequelize.STRING
      },
      en_parent: {
        type: Sequelize.INTEGER
      },
      en_active: {
        type: Sequelize.STRING
      },
      en_dt: {
        type: Sequelize.DATE
      },
      en_limit_account: {
        type: Sequelize.STRING
      },
      en_pi_id: {
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
    await queryInterface.dropTable('EnMstrs');
  }
};