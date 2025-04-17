'use strict';
const {
  Model, Op, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PidDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PidDet.belongsTo(models.PiMstr, {
        as: 'master_price_list',
        foreignKey: 'pid_pi_oid',
        targetKey: 'pi_oid'
      })

      PidDet.hasMany(models.PiddDet, {
        as: 'detail_price_list',
        sourceKey: 'pid_oid',
        foreignKey: 'pidd_pid_oid',
      })

      PidDet.hasOne(models.PiddDet, {
        as: 'singular_detail_price_list',
        sourceKey: 'pid_oid',
        foreignKey: 'pidd_pid_oid',
      })

      PidDet.belongsTo(models.PtMstr, {
        as: 'product',
        targetKey: 'pt_id',
        foreignKey: 'pid_pt_id'
      })
    }
  }
  PidDet.init({
    pid_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    pid_add_by: DataTypes.STRING,
    pid_add_date: DataTypes.DATE,
    pid_upd_date: DataTypes.DATE,
    pid_upd_by: DataTypes.STRING,
    pid_pi_oid: DataTypes.UUID,
    pid_pt_id: DataTypes.INTEGER,
    pid_dt: DataTypes.DATE,
    pid_pt_tax_class: DataTypes.INTEGER,
    pid_pt_ppn_type: DataTypes.STRING,
    pid_pt_taxable: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    tableName: 'pid_det',
    timestamps: false,
    scopes: {
      priceListDistributor: {
        where: {
          pid_pi_oid: {
            [Op.in]: [
              '75606dee-e498-4a5e-9858-568dfb1fb117', // => pricelist distributor mutif
              '83415091-54cc-4fd1-8e10-0dac3561fb9c', // => pricelist distributor damoza
              '80c389eb-dd3a-409c-81b3-c236e98f2c32' // => pricelist distributor upmore
            ]
          }
        }
      },
      priceListGroup(partnerGroupId) {
        return {
          where: {
            pid_pi_oid: {
              [Op.in]: Sequelize.literal(`(SELECT pi_oid FROM public.pi_mstr WHERE pi_ptnrg_id = ${partnerGroupId} AND pi_shown = 'Y')`)
            }
          }
        }
      }
    },
    modelName: 'PidDet',
  });
  return PidDet;
};