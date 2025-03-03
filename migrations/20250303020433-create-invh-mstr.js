'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('InvhMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invh_oid: {
        type: Sequelize.UUID
      },
      invh_tran_id: {
        type: Sequelize.INTEGER
      },
      invh_seq: {
        type: Sequelize.INTEGER
      },
      invh_dom_id: {
        type: Sequelize.INTEGER
      },
      invh_en_id: {
        type: Sequelize.INTEGER
      },
      invh_trn_code: {
        type: Sequelize.STRING
      },
      invh_trn_oid: {
        type: Sequelize.UUID
      },
      invh_date: {
        type: Sequelize.DATEONLY
      },
      invh_desc: {
        type: Sequelize.STRING
      },
      invh_opn_type: {
        type: Sequelize.STRING
      },
      invh_si_id: {
        type: Sequelize.INTEGER
      },
      invh_loc_id: {
        type: Sequelize.INTEGER
      },
      invh_pt_id: {
        type: Sequelize.INTEGER
      },
      invh_qty: {
        type: Sequelize.INTEGER
      },
      invh_cost: {
        type: Sequelize.INTEGER
      },
      invh_serial: {
        type: Sequelize.STRING
      },
      dt_timestamp: {
        type: Sequelize.DATE
      },
      invh_avg_cost: {
        type: Sequelize.INTEGER
      },
      invh_qty_old: {
        type: Sequelize.INTEGER
      },
      invh_pjc_id: {
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
    await queryInterface.dropTable('InvhMstrs');
  }
};