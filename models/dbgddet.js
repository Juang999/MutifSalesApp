'use strict';
const {
  Op,
  Model,
  Sequelize,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DbgdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      DbgdDet.hasOne(models.LocMstr, {
        as: 'singular_relation_partner_location',
        sourceKey: 'dbgd_ptnr_id',
        foreignKey: 'loc_ptnr_id'
      })
    }
  }
  DbgdDet.init({
    dbgd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    dbgd_dbg_oid: DataTypes.UUID,
    dbgd_en_id: DataTypes.INTEGER,
    dbgd_ptnr_id: DataTypes.INTEGER,
    dbgd_dbg_id: DataTypes.INTEGER,
    dbgd_parent_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'dbgd_det',
    timestamps: false,
    modelName: 'DbgdDet',
    scopes: {
      filterGroup(partnerId) {
        return {
          where: {
            dbgd_dbg_oid: {
              [Op.eq]: Sequelize.literal(`(SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${partnerId})`)
            }
          }
        }
      }
    }
  });
  return DbgdDet;
};