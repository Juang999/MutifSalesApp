'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtnraAddrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptnra_oid: {
        type: Sequelize.UUID
      },
      ptnra_id: {
        type: Sequelize.INTEGER
      },
      ptnra_dom_id: {
        type: Sequelize.INTEGER
      },
      ptnra_en_id: {
        type: Sequelize.INTEGER
      },
      ptnra_add_by: {
        type: Sequelize.STRING
      },
      ptnra_add_date: {
        type: Sequelize.DATE
      },
      ptnra_upd_by: {
        type: Sequelize.STRING
      },
      ptnra_upd_date: {
        type: Sequelize.DATE
      },
      ptnra_line: {
        type: Sequelize.INTEGER
      },
      ptnra_line_1: {
        type: Sequelize.STRING
      },
      ptnra_line_2: {
        type: Sequelize.STRING
      },
      ptnra_line_3: {
        type: Sequelize.STRING
      },
      ptnra_phone_1: {
        type: Sequelize.STRING
      },
      ptnra_phone_2: {
        type: Sequelize.STRING
      },
      ptnra_fax_1: {
        type: Sequelize.STRING
      },
      ptnra_fax_2: {
        type: Sequelize.STRING
      },
      ptnra_zip: {
        type: Sequelize.STRING
      },
      ptnra_ptnr_oid: {
        type: Sequelize.UUID
      },
      ptnra_addr_type: {
        type: Sequelize.INTEGER
      },
      ptnra_comment: {
        type: Sequelize.STRING
      },
      ptnra_active: {
        type: Sequelize.STRING
      },
      ptnra_dt: {
        type: Sequelize.DATE
      },
      ptnra_line_4: {
        type: Sequelize.STRING
      },
      ptnra_line_5: {
        type: Sequelize.STRING
      },
      ptnra_lat_addr: {
        type: Sequelize.INTEGER
      },
      ptnra_long_addr: {
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
    await queryInterface.dropTable('PtnraAddrs');
  }
};