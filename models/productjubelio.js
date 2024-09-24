'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductJubelio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductJubelio.hasOne(models.ProductJubelioThumbnail, {
        as: 'singular_thumbnail_product',
        sourceKey: 'pj_item_id',
        foreignKey: 'pjt_item_id'
      })
    }
  }
  ProductJubelio.init({
    pj_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    pj_item_id: DataTypes.INTEGER,
    pj_item_code: DataTypes.STRING,
    pj_item_name: DataTypes.STRING,
    pj_available_qty: DataTypes.INTEGER,
    pj_buy_price: DataTypes.INTEGER,
    pj_is_consignment: DataTypes.BOOLEAN,
    pj_buy_unit: DataTypes.STRING,
    pj_account_code: DataTypes.STRING,
    pj_account_name: DataTypes.STRING,
    pj_uom_id: DataTypes.INTEGER,
    pj_invt_acct_id: DataTypes.INTEGER,
    pj_brand_name: DataTypes.STRING,
    pj_item_full_name: DataTypes.STRING,
    pj_use_serial_number: DataTypes.BOOLEAN,
    pj_use_batch_number: DataTypes.BOOLEAN,
    pj_coalesce: DataTypes.INTEGER,
    pj_average_cost: DataTypes.INTEGER,
    pj_end_qty: DataTypes.INTEGER,
    pj_order_qty: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'product_jubelio',
    modelName: 'ProductJubelio',
  });
  return ProductJubelio;
};