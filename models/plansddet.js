'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlansdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlansdDet.init({
    plansd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    plansd_plans_oid: DataTypes.UUID,
    plansd_ptnr_id: DataTypes.INTEGER,
    plansd_amount: DataTypes.INTEGER,
    plansd_seq: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'plansd_det',
    timestamps: false,
    modelName: 'PlansdDet',
  });
  return PlansdDet;
};