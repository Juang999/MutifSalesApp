'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DbrMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dbr_oid: {
        type: Sequelize.UUID
      },
      dbr_code: {
        type: Sequelize.STRING
      },
      dbr_date: {
        type: Sequelize.DATEONLY
      },
      dbr_dbgcity_id: {
        type: Sequelize.INTEGER
      },
      dbr_start_date: {
        type: Sequelize.DATE
      },
      dbr_end_date: {
        type: Sequelize.DATE
      },
      dbr_remarks: {
        type: Sequelize.STRING
      },
      dbr_add_date: {
        type: Sequelize.DATE
      },
      dbr_add_by: {
        type: Sequelize.STRING
      },
      dbr_upd_date: {
        type: Sequelize.DATE
      },
      dbr_upd_by: {
        type: Sequelize.STRING
      },
      dbr_dbg_oid: {
        type: Sequelize.UUID
      },
      dbr_slsprog_id: {
        type: Sequelize.INTEGER
      },
      dbr_periode_id: {
        type: Sequelize.INTEGER
      },
      dbr_periode_point: {
        type: Sequelize.INTEGER
      },
      dbr_close_stat: {
        type: Sequelize.STRING
      },
      dbr_close_date: {
        type: Sequelize.DATEONLY
      },
      dbr_prev_point: {
        type: Sequelize.INTEGER
      },
      dbr_policy_point: {
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
    await queryInterface.dropTable('DbrMstrs');
  }
};