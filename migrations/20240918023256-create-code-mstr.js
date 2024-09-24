'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CodeMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code_oid: {
        type: Sequelize.UUID
      },
      code_dom_id: {
        type: Sequelize.INTEGER
      },
      code_en_id: {
        type: Sequelize.INTEGER
      },
      code_add_by: {
        type: Sequelize.STRING
      },
      code_add_date: {
        type: Sequelize.DATE
      },
      code_upd_by: {
        type: Sequelize.STRING
      },
      code_upd_date: {
        type: Sequelize.DATE
      },
      code_id: {
        type: Sequelize.INTEGER
      },
      code_seq: {
        type: Sequelize.INTEGER
      },
      code_field: {
        type: Sequelize.STRING
      },
      code_code: {
        type: Sequelize.STRING
      },
      code_name: {
        type: Sequelize.STRING
      },
      code_desc: {
        type: Sequelize.STRING
      },
      code_default: {
        type: Sequelize.STRING
      },
      code_parent: {
        type: Sequelize.INTEGER
      },
      code_usr_1: {
        type: Sequelize.STRING
      },
      code_usr_2: {
        type: Sequelize.STRING
      },
      code_usr_3: {
        type: Sequelize.STRING
      },
      code_usr_4: {
        type: Sequelize.STRING
      },
      code_usr_5: {
        type: Sequelize.STRING
      },
      code_active: {
        type: Sequelize.STRING
      },
      code_dt: {
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
    await queryInterface.dropTable('CodeMstrs');
  }
};