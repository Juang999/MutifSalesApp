'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtnrMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ptnr_oid: {
        type: Sequelize.UUID
      },
      ptnr_dom_id: {
        type: Sequelize.INTEGER
      },
      ptnr_en_id: {
        type: Sequelize.INTEGER
      },
      ptnr_add_by: {
        type: Sequelize.STRING
      },
      ptnr_add_date: {
        type: Sequelize.DATE
      },
      ptnr_upd_by: {
        type: Sequelize.STRING
      },
      ptnr_upd_date: {
        type: Sequelize.DATE
      },
      ptnr_id: {
        type: Sequelize.INTEGER
      },
      ptnr_code: {
        type: Sequelize.STRING
      },
      ptnr_name: {
        type: Sequelize.STRING
      },
      ptnr_ptnrg_id: {
        type: Sequelize.INTEGER
      },
      ptnr_url: {
        type: Sequelize.STRING
      },
      ptnr_remarks: {
        type: Sequelize.STRING
      },
      ptnr_parent: {
        type: Sequelize.INTEGER
      },
      ptnr_is_cust: {
        type: Sequelize.STRING
      },
      ptnr_is_vend: {
        type: Sequelize.STRING
      },
      ptnr_active: {
        type: Sequelize.STRING
      },
      ptnr_dt: {
        type: Sequelize.DATE
      },
      ptnr_ac_ar_id: {
        type: Sequelize.INTEGER
      },
      ptnr_sb_ar_id: {
        type: Sequelize.INTEGER
      },
      ptnr_cc_ar_id: {
        type: Sequelize.INTEGER
      },
      ptnr_ac_ap_id: {
        type: Sequelize.INTEGER
      },
      ptnr_sb_ap_id: {
        type: Sequelize.INTEGER
      },
      ptnr_cc_ap_id: {
        type: Sequelize.INTEGER
      },
      ptnr_cu_id: {
        type: Sequelize.INTEGER
      },
      ptnr_limit_credit: {
        type: Sequelize.INTEGER
      },
      ptnr_is_member: {
        type: Sequelize.STRING
      },
      ptnr_prepaid_balance: {
        type: Sequelize.INTEGER
      },
      ptnr_is_emp: {
        type: Sequelize.STRING
      },
      ptnr_npwp: {
        type: Sequelize.STRING
      },
      ptnr_nppkp: {
        type: Sequelize.STRING
      },
      ptnr_is_writer: {
        type: Sequelize.STRING
      },
      ptnr_transaction_code_id: {
        type: Sequelize.INTEGER
      },
      ptnr_email: {
        type: Sequelize.STRING
      },
      ptnr_address_tax: {
        type: Sequelize.STRING
      },
      ptnr_contact_tax: {
        type: Sequelize.STRING
      },
      ptnr_name_alt: {
        type: Sequelize.STRING
      },
      ptnr_is_ps: {
        type: Sequelize.STRING
      },
      ptnr_lvl_id: {
        type: Sequelize.INTEGER
      },
      ptnr_start_periode: {
        type: Sequelize.STRING
      },
      ptnr_user_name: {
        type: Sequelize.STRING
      },
      ptnr_is_bm: {
        type: Sequelize.STRING
      },
      ptnr_bank: {
        type: Sequelize.STRING
      },
      ptnr_no_rek: {
        type: Sequelize.STRING
      },
      ptnr_rek_name: {
        type: Sequelize.STRING
      },
      ptnr_imei: {
        type: Sequelize.STRING
      },
      ptnr_sex: {
        type: Sequelize.INTEGER
      },
      ptnr_goldarah: {
        type: Sequelize.INTEGER
      },
      ptnr_birthday: {
        type: Sequelize.DATE
      },
      ptnr_birthcity: {
        type: Sequelize.STRING
      },
      ptnr_negara: {
        type: Sequelize.INTEGER
      },
      ptnr_bp_date: {
        type: Sequelize.DATE
      },
      ptnr_bp_type: {
        type: Sequelize.INTEGER
      },
      ptnr_waris_name: {
        type: Sequelize.STRING
      },
      ptnr_waris_ktp: {
        type: Sequelize.STRING
      },
      ptnr_ktp: {
        type: Sequelize.STRING
      },
      ptnr_is_volunteer: {
        type: Sequelize.STRING
      },
      ptnr_is_sbm: {
        type: Sequelize.STRING
      },
      ptnr_area_id: {
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
    await queryInterface.dropTable('PtnrMstrs');
  }
};