'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlansptdDet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlansptdDet.init({
    plansptd_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    plansptd_plans_oid: DataTypes.UUID,
    plansptd_pt_id: DataTypes.INTEGER,
    plansptd_amount: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'plansptd_det',
    timestamps: false,
    modelName: 'PlansptdDet',
  });
  return PlansptdDet;
};