'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LocMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      loc_oid: {
        type: Sequelize.UUID
      },
      loc_dom_id: {
        type: Sequelize.INTEGER
      },
      loc_en_id: {
        type: Sequelize.INTEGER
      },
      loc_add_by: {
        type: Sequelize.STRING
      },
      loc_add_date: {
        type: Sequelize.DATE
      },
      loc_upd_by: {
        type: Sequelize.STRING
      },
      loc_upd_date: {
        type: Sequelize.DATE
      },
      loc_id: {
        type: Sequelize.INTEGER
      },
      loc_wh_id: {
        type: Sequelize.INTEGER
      },
      loc_si_id: {
        type: Sequelize.INTEGER
      },
      loc_code: {
        type: Sequelize.STRING
      },
      loc_desc: {
        type: Sequelize.STRING
      },
      loc_type: {
        type: Sequelize.INTEGER
      },
      loc_cat: {
        type: Sequelize.INTEGER
      },
      loc_is_id: {
        type: Sequelize.INTEGER
      },
      loc_active: {
        type: Sequelize.STRING
      },
      loc_dt: {
        type: Sequelize.DATEONLY
      },
      loc_git: {
        type: Sequelize.STRING
      },
      loc_ptnr_id: {
        type: Sequelize.INTEGER
      },
      loc_default: {
        type: Sequelize.STRING
      },
      loc_booked: {
        type: Sequelize.STRING
      },
      loc_parent_id: {
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
    await queryInterface.dropTable('LocMstrs');
  }
};