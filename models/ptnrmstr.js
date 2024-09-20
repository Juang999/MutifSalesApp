'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PtnrMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PtnrMstr.belongsTo(models.PtnrgGrp, {
        as: 'group_partner',
        targetKey: 'ptnrg_id',
        foreignKey: 'ptnr_ptnrg_id'
      })

      PtnrMstr.hasOne(models.TConfUser, {
        as: 'user',
        sourceKey: 'ptnr_id',
        foreignKey: 'user_ptnr_id'
      })

      PtnrMstr.hasOne(models.PtnraAddr, {
        as: 'singular_partner_address',
        sourceKey: 'ptnr_oid',
        foreignKey: 'ptnra_ptnr_oid'
      })

      PtnrMstr.hasMany(models.SqMstr, {
        as: 'sales_quotation',
        sourceKey: 'ptnr_id',
        foreignKey:'sq_ptnr_id_sold'
      })
    }
  }
  PtnrMstr.init({
    ptnr_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    ptnr_dom_id: DataTypes.INTEGER,
    ptnr_en_id: DataTypes.INTEGER,
    ptnr_add_by: DataTypes.STRING,
    ptnr_add_date: DataTypes.DATE,
    ptnr_upd_by: DataTypes.STRING,
    ptnr_upd_date: DataTypes.DATE,
    ptnr_id: DataTypes.INTEGER,
    ptnr_code: DataTypes.STRING,
    ptnr_name: DataTypes.STRING,
    ptnr_ptnrg_id: DataTypes.INTEGER,
    ptnr_url: DataTypes.STRING,
    ptnr_remarks: DataTypes.STRING,
    ptnr_parent: DataTypes.INTEGER,
    ptnr_is_cust: DataTypes.STRING,
    ptnr_is_vend: DataTypes.STRING,
    ptnr_active: DataTypes.STRING,
    ptnr_dt: DataTypes.DATE,
    ptnr_ac_ar_id: DataTypes.INTEGER,
    ptnr_sb_ar_id: DataTypes.INTEGER,
    ptnr_cc_ar_id: DataTypes.INTEGER,
    ptnr_ac_ap_id: DataTypes.INTEGER,
    ptnr_sb_ap_id: DataTypes.INTEGER,
    ptnr_cc_ap_id: DataTypes.INTEGER,
    ptnr_cu_id: DataTypes.INTEGER,
    ptnr_limit_credit: DataTypes.INTEGER,
    ptnr_is_member: DataTypes.STRING,
    ptnr_prepaid_balance: DataTypes.INTEGER,
    ptnr_is_emp: DataTypes.STRING,
    ptnr_npwp: DataTypes.STRING,
    ptnr_nppkp: DataTypes.STRING,
    ptnr_is_writer: DataTypes.STRING,
    ptnr_transaction_code_id: DataTypes.INTEGER,
    ptnr_email: DataTypes.STRING,
    ptnr_address_tax: DataTypes.STRING,
    ptnr_contact_tax: DataTypes.STRING,
    ptnr_name_alt: DataTypes.STRING,
    ptnr_is_ps: DataTypes.STRING,
    ptnr_lvl_id: DataTypes.INTEGER,
    ptnr_start_periode: DataTypes.STRING,
    ptnr_user_name: DataTypes.STRING,
    ptnr_is_bm: DataTypes.STRING,
    ptnr_bank: DataTypes.STRING,
    ptnr_no_rek: DataTypes.STRING,
    ptnr_rek_name: DataTypes.STRING,
    ptnr_imei: DataTypes.STRING,
    ptnr_sex: DataTypes.INTEGER,
    ptnr_goldarah: DataTypes.INTEGER,
    ptnr_birthday: DataTypes.DATE,
    ptnr_birthcity: DataTypes.STRING,
    ptnr_negara: DataTypes.INTEGER,
    ptnr_bp_date: DataTypes.DATE,
    ptnr_bp_type: DataTypes.INTEGER,
    ptnr_waris_name: DataTypes.STRING,
    ptnr_waris_ktp: DataTypes.STRING,
    ptnr_ktp: DataTypes.STRING,
    ptnr_is_volunteer: DataTypes.STRING,
    ptnr_is_sbm: DataTypes.STRING,
    ptnr_area_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'ptnr_mstr',
    modelName: 'PtnrMstr',
  });
  return PtnrMstr;
};