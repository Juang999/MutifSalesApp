'use strict';
const {
  Model, Op
} = require('sequelize');
const {info} = require('../helper/Logging')
module.exports = (sequelize, DataTypes) => {
  class ChartSales extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChartSales.belongsTo(models.PtMstr, {
        as: 'product',
        foreignKey: 'cs_pt_id',
        targetKey: 'pt_id'
      })

      ChartSales.belongsTo(models.InvcMstr, {
        as: 'qty_location',
        foreignKey: 'cs_invc_oid',
        targetKey: 'invc_oid'
      })

      ChartSales.belongsTo(models.InvcMstr, {
        as: 'product_qty_location',
        foreignKey: 'cs_pt_id',
        targetKey: 'invc_pt_id'
      })

      ChartSales.hasMany(models.InvcMstr, {
        as: 'data_inventory',
        sourceKey: 'cs_pt_id',
        foreignKey: 'invc_pt_id'
      })

      ChartSales.belongsTo(models.PiMstr, {
        as: 'pricelist',
        foreignKey: 'cs_pi_id',
        targetKey: 'pi_id'
      })

      ChartSales.hasOne(models.InvcdDet, {
        as: 'singular_serial',
        sourceKey: 'cs_oid',
        foreignKey: 'invcd_cs_oid'
      })

      ChartSales.belongsTo(models.TransStatus, {
        as: 'status_transaction',
        targetKey: 'trans_id',
        foreignKey: 'cs_trans_id'
      })

      ChartSales.hasOne(models.PidDet, {
        as: 'detail_relation_price_list',
        sourceKey: 'cs_pt_id',
        foreignKey: 'pid_pt_id'
      })
    }
  }
  ChartSales.init({
    cs_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    cs_userid: DataTypes.BIGINT,
    cs_pt_id: DataTypes.BIGINT,
    cs_pt_en_id: DataTypes.BIGINT,
    cs_invc_oid: DataTypes.UUID,
    cs_qty: DataTypes.INTEGER,
    cs_created_at: DataTypes.DATE,
    cs_updated_at: DataTypes.DATE,
    cs_pi_id: DataTypes.BIGINT,
    cs_trans_id: DataTypes.STRING,
    cs_created_by: DataTypes.STRING,
    cs_updated_by: DataTypes.STRING,
    cs_preorder: DataTypes.STRING,
    cs_deleted_at: DataTypes.DATE,
    cs_deleted_by: DataTypes.STRING,
    cs_flashsale: DataTypes.STRING,
    cs_spesific_price: DataTypes.STRING,
    cs_ready_to_checkout: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    tableName: 'chart_sales',
    timestamps: false,
    modelName: 'ChartSales',
    paranoid: true,
    deletedAt: 'cs_deleted_at',
    scopes: {
      showCart: {
        where: {
          cs_trans_id: {
            [Op.in]: ['D', 'E']
          }
        }
      },
      defaultTransId: {
        where: {
          cs_trans_id: 'D'
        }
      },
      isReguler: {
        where: {
          cs_preorder: 'N'
        }
      },
      isPreOrder: {
        where: {
          cs_preorder: 'Y'
        }
      }
    },
    hooks: { 
      afterCreate: ({dataValues}) => {
        info('CHART', 'CREATED', dataValues)
      },
      afterUpdate: ({dataValues}) => {
        info('CHART', 'UPDATED', dataValues)
      },
      afterDestroy: ({dataValues}) => {
        info('CHART', 'DELETED!', dataValues)
      }
    }
  });
  return ChartSales;
};