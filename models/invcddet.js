'use strict';
const {
  Model
} = require('sequelize');
const {
  Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvcdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      InvcdDet.belongsTo(models.PtMstr, {
        as: 'detail_inventory',
        targetKey: 'pt_id',
        foreignKey: 'invcd_pt_id'
      })
    }
  }
  InvcdDet.init({
    invcd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    invcd_invc_oid: DataTypes.UUID,
    invcd_dom_id: DataTypes.INTEGER,
    invcd_en_id: DataTypes.INTEGER,
    invcd_pt_id: DataTypes.INTEGER,
    invcd_qty: DataTypes.INTEGER,
    invcd_lot_serial: DataTypes.STRING,
    invcd_qrbarcode: {
      type: DataTypes.STRING,
      unique: true
    },
    invcd_loc_id: DataTypes.INTEGER,
    invcd_locs_id: DataTypes.INTEGER,
    invcd_um: DataTypes.INTEGER,
    invcd_color_code: DataTypes.STRING,
    invcd_weight: DataTypes.INTEGER,
    invcd_trans_code: DataTypes.STRING,
    invcd_remarks: DataTypes.STRING,
    invcd_add_date: DataTypes.DATE,
    invcd_add_by: DataTypes.STRING,
    invcd_upd_date: DataTypes.DATE,
    invcd_upd_by: DataTypes.STRING,
    invcd_qty_old: DataTypes.INTEGER,
    invcd_si_id: DataTypes.DATE,
    invcd_is_verified: DataTypes.STRING,
    invcd_is_booked: DataTypes.STRING,
    invcd_transaction_code: DataTypes.STRING,
    invcd_alias_qrbarcode: DataTypes.STRING,
    invcd_cs_oid: DataTypes.UUID,
  }, {
    sequelize,
    scopes: {
      gudangReguler: {
        where: {
          [Op.or]: [
            {
                invcd_en_id: 1,
                invcd_loc_id: 1000555,
            }, {
                invcd_en_id: 2,
                invcd_loc_id: 2000556,
            }, {
                invcd_en_id: 3,
                invcd_loc_id: 3000557,
            }
          ]
        }
      },
      isVerified: {
        where: {
          invcd_is_verified: 'Y'
        }
      },
      bookedIsNull: {
        where: {
          invcd_is_booked: {
            [Op.is]: null
          }
        }
      },
      isNotZero: {
        where: {
          invcd_qty: {
            [Op.not]: 0
          }
        }
      }
    },
    schema: 'public',
    tableName: 'invcd_det',
    timestamps: false,
    modelName: 'InvcdDet',
  });
  return InvcdDet;
};