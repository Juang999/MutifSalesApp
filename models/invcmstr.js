'use strict';
const {
  Model, Op
} = require('sequelize');
const {info} = require('../helper/Logging');
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

      InvcMstr.belongsTo(models.PtMstr, {
        as: 'product_knowledge',
        targetKey: 'pt_id',
        foreignKey: 'invc_pt_id'
      })

      InvcMstr.belongsTo(models.EnMstr, {
        as: 'entity_inventory',
        targetKey: 'en_id',
        foreignKey: 'invc_en_id'
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
    invc_shwn_id: DataTypes.INTEGER,
    invc_is_verified: DataTypes.STRING
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
                invc_loc_id: {
                  [Op.in]: [10001, 1000555]
                },
            }, {
                invc_en_id: 2,
                invc_loc_id: {
                  [Op.in]: [200010, 2000556]
                },
            }, {
                invc_en_id: 3,
                invc_loc_id: {
                  [Op.in]: [300018, 3000557]
                },
            }
          ]
        }
      },
      isVerified: {
        where: {
          invc_is_verified: 'Y'
        }
      },
      gudangReguler: {
        where: {
          [Op.or]: [
            {
                invc_en_id: 1,
                invc_loc_id: 1000555,
            }, {
                invc_en_id: 2,
                invc_loc_id: 2000556,
            }, {
                invc_en_id: 3,
                invc_loc_id: 3000557,
            }
          ]
        }
      },
      FILTER_BERDASARKAN_GUDANG_BARANG_JADI_ATAU_GUDANG_REGULER: {
        [Op.or]: [
          {
              invc_en_id: 1,
              invc_loc_id: {
                [Op.in]: [10001, 1000555]
              },
          }, {
              invc_en_id: 2,
              invc_loc_id: {
                [Op.in]: [200010, 2000556]
              },
          }, {
              invc_en_id: 3,
              invc_loc_id: {
                [Op.in]: [300018, 3000557]
              },
          }
        ]
      }
    },
    hooks: {
      afterCreate: ({dataValues}) => {
        info('INVENTORY', 'CREATED', dataValues)
      },
      afterUpdate: ({dataValues}) => {
        info('INVENTORY', 'UPDATED', dataValues)
      },
      afterDestroy: ({dataValues}) => {
        info('INVENTORY', 'DELETED!', dataValues)
      }
    }
  });
  return InvcMstr;
};