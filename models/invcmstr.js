'use strict';
const {
  Model
} = require('sequelize');
const {
  Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvcMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      InvcMstr.belongsTo(models.LocMstr, {
        as: 'location',
        foreignKey: 'invc_loc_id',
        targetKey: 'loc_id'
      })
    }
  }
  InvcMstr.init({
    invc_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    invc_dom_id: DataTypes.INTEGER,
    invc_en_id: DataTypes.INTEGER,
    invc_si_id: DataTypes.INTEGER,
    invc_loc_id: DataTypes.INTEGER,
    invc_pt_id: DataTypes.INTEGER,
    invc_qty_available: DataTypes.INTEGER,
    invc_qty_booked: DataTypes.INTEGER,
    invc_qty: DataTypes.INTEGER,
    invc_qty_old: DataTypes.INTEGER,
    invc_serial: DataTypes.STRING,
    pt_tax_class: DataTypes.STRING,
    invc_qty_alloc: DataTypes.INTEGER,
    invc_sq_booking: DataTypes.STRING,
    invc_last_booked: DataTypes.DATEONLY,
    invc_total: DataTypes.INTEGER,
    invc_qty_booking: DataTypes.INTEGER,
    invc_shwn_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'invc_mstr',
    modelName: 'InvcMstr',
    scopes: {
      gudangBarangJadi: {
        where: {
          invc_loc_id: {
            [Op.in]: [10001, 200010, 300018]
          }
        }
      },
      notEmpty: {
        where: {
          invc_qty_available: {
            [Op.not]: 0
          }
        }
      },
      gudangSesuaiDenganEntitas: {
        where: {
          [Op.or]: [
            {
                invc_en_id: 1,
                invc_loc_id: 10001,
            }, {
                invc_en_id: 2,
                invc_loc_id: 200010,
            }, {
                invc_en_id: 3,
                invc_loc_id: 300018,
            }
        ]
        }
      }
    }
  });
  return InvcMstr;
};