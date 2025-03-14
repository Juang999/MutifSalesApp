'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wishlist.belongsTo(models.PtMstr, {
        targetKey: 'pt_id',
        foreignKey: 'wl_pt_id',
        as: 'product'
      })

      Wishlist.belongsTo(models.TConfUser, {
        targetKey: 'userid',
        foreignKey: 'wl_user_id',
        as: 'user'
      })

      Wishlist.belongsTo(models.InvcMstr, {
        as: 'inventory_product',
        targetKey: 'invc_oid',
        foreignKey: 'wl_invc_oid'
      })

      Wishlist.belongsTo(models.PiMstr, {
        as: 'pricelist_master',
        targetKey: 'pi_id',
        foreignKey: 'wl_pi_id'
      })
    }
  }
  Wishlist.init({
    wl_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    wl_pt_id: DataTypes.INTEGER,
    wl_qty: DataTypes.INTEGER,
    wl_user_id: DataTypes.INTEGER,
    wl_en_id: DataTypes.INTEGER,
    wl_invc_oid: DataTypes.UUID,
    wl_pi_id: DataTypes.INTEGER,
    wl_created_at: DataTypes.DATE,
    wl_updated_at: DataTypes.DATE,
    wl_sq_oid: DataTypes.UUID,
    wl_status: DataTypes.STRING,
    wl_is_po: DataTypes.BOOLEAN
  }, {
    sequelize,
    schema: 'public',
    tableName: 'wishlists',
    timestamps: false,
    modelName: 'Wishlist',
    scopes: {
      isWishlist: {
        where: {
          wl_is_po: false
        }
      },
      isPreOrder: {
        where: {
          wl_is_po: true
        }
      }
    }
  });
  return Wishlist;
};