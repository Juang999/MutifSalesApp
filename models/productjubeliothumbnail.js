'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductJubelioThumbnail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ProductJubelioThumbnail.init({
    pjt_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    pjt_item_id: DataTypes.INTEGER,
    pjt_group_id: DataTypes.INTEGER,
    pjt_variant: DataTypes.STRING,
    pjt_thumbnail: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'product_jubelio_thumbnail',
    modelName: 'ProductJubelioThumbnail',
  });
  return ProductJubelioThumbnail;
};