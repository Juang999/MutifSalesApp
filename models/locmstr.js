'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LocMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LocMstr.belongsTo(models.PtnrMstr, {
        as: 'detail_partner',
        targetKey: 'ptnr_id',
        foreignKey: 'loc_ptnr_id'
      })
    }
  }
  LocMstr.init({
    loc_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    loc_dom_id: DataTypes.INTEGER,
    loc_en_id: DataTypes.INTEGER,
    loc_add_by: DataTypes.STRING,
    loc_add_date: DataTypes.DATE,
    loc_upd_by: DataTypes.STRING,
    loc_upd_date: DataTypes.DATE,
    loc_id: DataTypes.INTEGER,
    loc_wh_id: DataTypes.INTEGER,
    loc_si_id: DataTypes.INTEGER,
    loc_code: DataTypes.STRING,
    loc_desc: DataTypes.STRING,
    loc_type: DataTypes.INTEGER,
    loc_cat: DataTypes.INTEGER,
    loc_is_id: DataTypes.INTEGER,
    loc_active: DataTypes.STRING,
    loc_dt: DataTypes.DATEONLY,
    loc_git: DataTypes.STRING,
    loc_ptnr_id: DataTypes.INTEGER,
    loc_default: DataTypes.STRING,
    loc_booked: DataTypes.STRING,
    loc_parent_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'loc_mstr',
    modelName: 'LocMstr',
  });
  return LocMstr;
};