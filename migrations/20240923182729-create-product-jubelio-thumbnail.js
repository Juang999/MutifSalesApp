'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductJubelioThumbnails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pjt_oid: {
        type: Sequelize.UUID
      },
      pjt_item_id: {
        type: Sequelize.INTEGER
      },
      pjt_group_id: {
        type: Sequelize.INTEGER
      },
      pjt_variant: {
        type: Sequelize.STRING
      },
      pjt_thumbnail: {
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
    await queryInterface.dropTable('ProductJubelioThumbnails');
  }
};