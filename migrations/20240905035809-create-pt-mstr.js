'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PtMstrs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pt_oid: {
        type: Sequelize.UUID
      },
      pt_dom_id: {
        type: Sequelize.INTEGER
      },
      pt_en_id: {
        type: Sequelize.INTEGER
      },
      pt_add_by: {
        type: Sequelize.STRING
      },
      pt_add_date: {
        type: Sequelize.DATE
      },
      pt_upd_by: {
        type: Sequelize.STRING
      },
      pt_upd_date: {
        type: Sequelize.DATE
      },
      pt_id: {
        type: Sequelize.INTEGER
      },
      pt_code: {
        type: Sequelize.STRING
      },
      pt_desc1: {
        type: Sequelize.STRING
      },
      pt_desc2: {
        type: Sequelize.STRING
      },
      pt_pl_id: {
        type: Sequelize.INTEGER
      },
      pt_um: {
        type: Sequelize.INTEGER
      },
      pt_its_id: {
        type: Sequelize.INTEGER
      },
      pt_type: {
        type: Sequelize.STRING
      },
      pt_cost_method: {
        type: Sequelize.STRING
      },
      pt_loc_type: {
        type: Sequelize.INTEGER
      },
      pt_po_is: {
        type: Sequelize.INTEGER
      },
      pt_group: {
        type: Sequelize.INTEGER
      },
      pt_taxable: {
        type: Sequelize.STRING
      },
      pt_pm_code: {
        type: Sequelize.STRING
      },
      pt_ls: {
        type: Sequelize.STRING
      },
      pt_sfty_stk: {
        type: Sequelize.INTEGER
      },
      pt_rop: {
        type: Sequelize.INTEGER
      },
      pt_ord_min: {
        type: Sequelize.INTEGER
      },
      pt_ord_max: {
        type: Sequelize.INTEGER
      },
      pt_cost: {
        type: Sequelize.INTEGER
      },
      pt_price: {
        type: Sequelize.INTEGER
      },
      pt_dt: {
        type: Sequelize.DATE
      },
      pt_loc_id: {
        type: Sequelize.INTEGER
      },
      pt_syslog_code: {
        type: Sequelize.STRING
      },
      pt_class: {
        type: Sequelize.STRING
      },
      pt_writer_id: {
        type: Sequelize.INTEGER
      },
      pt_eng_id: {
        type: Sequelize.INTEGER
      },
      pt_ppn_type: {
        type: Sequelize.STRING
      },
      pt_tax_class: {
        type: Sequelize.INTEGER
      },
      pt_si_id: {
        type: Sequelize.INTEGER
      },
      pt_tax_inc: {
        type: Sequelize.STRING
      },
      pt_approval_status: {
        type: Sequelize.STRING
      },
      pt_isbn: {
        type: Sequelize.STRING
      },
      pt_phantom: {
        type: Sequelize.STRING
      },
      pt_ro_id: {
        type: Sequelize.INTEGER
      },
      pt_gambar: {
        type: Sequelize.STRING
      },
      pt_qty: {
        type: Sequelize.INTEGER
      },
      pt_additional: {
        type: Sequelize.STRING
      },
      pt_year: {
        type: Sequelize.DATEONLY
      },
      pt_size_code_id: {
        type: Sequelize.INTEGER
      },
      pt_psplan_id: {
        type: Sequelize.INTEGER
      },
      pt_cat_id: {
        type: Sequelize.INTEGER
      },
      pt_scat_id: {
        type: Sequelize.INTEGER
      },
      pt_color_tag: {
        type: Sequelize.STRING
      },
      pt_clothes_id: {
        type: Sequelize.INTEGER
      },
      pt_parent_cat_id: {
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
    await queryInterface.dropTable('PtMstrs');
  }
};