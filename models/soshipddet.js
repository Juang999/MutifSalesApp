'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SoShipdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SoShipdDet.belongsTo(models.SodDet, {
        as: 'detail_sales_order',
        targetKey: 'sod_oid',
        foreignKey: 'soshipd_sod_oid'
      })
    }
  }
  SoShipdDet.init({
    soshipd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    soshipd_soship_oid: DataTypes.UUID,
    soshipd_sod_oid: DataTypes.UUID,
    soshipd_seq: DataTypes.INTEGER,
    soshipd_qty: DataTypes.INTEGER,
    soshipd_um: DataTypes.INTEGER,
    soshipd_um_conv: DataTypes.INTEGER,
    soshipd_cancel_bo: DataTypes.STRING,
    soshipd_qty_real: DataTypes.INTEGER,
    soshipd_si_id: DataTypes.INTEGER,
    soshipd_loc_id: DataTypes.INTEGER,
    soshipd_lot_serial: DataTypes.STRING,
    soshipd_rea_code_id: DataTypes.INTEGER,
    soshipd_dt: DataTypes.DATE,
    soshipd_qty_inv: DataTypes.INTEGER,
    soshipd_close_line: DataTypes.STRING,
    soshipd_qty_allocated: DataTypes.INTEGER,
    soshipd_qty_booked: DataTypes.INTEGER,
    soshipd_sqd_oid: DataTypes.UUID,
    soshipd_part: DataTypes.STRING,
    soshipd_qty_cheked: DataTypes.INTEGER,
    soshipd_en_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'soshipd_det',
    timestamps: false,
    modelName: 'SoShipdDet',
  });
  return SoShipdDet;
};