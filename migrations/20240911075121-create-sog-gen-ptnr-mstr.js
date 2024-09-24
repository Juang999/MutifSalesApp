'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SogGenPtnrMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sog_gen_ptnr_mstr_oid: {
        type: Sequelize.UUID
      },
      sog_gen_ptnr_mstr_id: {
        type: Sequelize.BIGINT
      },
      sog_gen_ptnr_mstr_en_id: {
        type: Sequelize.INTEGER
      },
      sog_gen_ptnr_mstr_code: {
        type: Sequelize.STRING
      },
      sog_gen_ptnr_mstr_name: {
        type: Sequelize.STRING
      },
      sog_gen_ptnr_mstr_addr: {
        type: Sequelize.STRING
      },
      sog_gen_ptnr_mstr_jbl_id: {
        type: Sequelize.INTEGER
      },
      sog_gen_ptnr_mstr_is_cus: {
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
    await queryInterface.dropTable('SogGenPtnrMstrs');
  }
};