'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TConfUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userid: {
        type: Sequelize.INTEGER
      },
      userkode: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      groupid: {
        type: Sequelize.INTEGER
      },
      last_access: {
        type: Sequelize.DATE
      },
      id_karyawan: {
        type: Sequelize.INTEGER
      },
      time_reminder: {
        type: Sequelize.INTEGER
      },
      en_id: {
        type: Sequelize.INTEGER
      },
      useractive: {
        type: Sequelize.STRING
      },
      useremail: {
        type: Sequelize.STRING
      },
      usernik: {
        type: Sequelize.STRING
      },
      userpidgin: {
        type: Sequelize.STRING
      },
      userpidgin_hris: {
        type: Sequelize.STRING
      },
      userphone: {
        type: Sequelize.STRING
      },
      user_ptnr_id: {
        type: Sequelize.INTEGER
      },
      user_imei: {
        type: Sequelize.STRING
      },
      nik_id: {
        type: Sequelize.STRING
      },
      user_ptnrg_id: {
        type: Sequelize.INTEGER
      },
      user_group_id: {
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      api_token: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
      pin: {
        type: Sequelize.STRING
      },
      user_id_telegram: {
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
    await queryInterface.dropTable('TConfUsers');
  }
};