'use strict';

const moment = require('moment');
const {v4: uuidv4} = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    let periodes = [];
    let id = 36;

    for (let index = 0; index < 12; index++) {
      id += 1;

      periodes.push({
        periode_oid: uuidv4(),
        periode_code: moment().month(index).add(2, 'year').format('YYYYMM'),
        periode_start_date: moment().month(index).add(2, 'year').startOf('months').format('YYYY-MM-DD'),
        periode_end_date: moment().month(index).add(2, 'year').endOf('months').format('YYYY-MM-DD'),
        periode_active: 'Y',
        periode_add_by: 'admin',
        periode_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        periode_upd_by: 'admin',
        periode_upd_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        periode_id: id
      })
    }

    // console.info(periodes)
    return await queryInterface.bulkInsert('psperiode_mstr', periodes);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

  }
};
