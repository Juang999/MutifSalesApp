'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlansMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PlansMstr.init({
    plans_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    plans_code: DataTypes.STRING,
    plans_date: DataTypes.DATEONLY,
    plans_periode: DataTypes.STRING,
    plans_sales_id: DataTypes.INTEGER,
    plans_add_by: DataTypes.STRING,
    plans_add_date: DataTypes.DATE,
    plans_upd_by: DataTypes.STRING,
    plans_upd_date: DataTypes.DATE,
    plans_amount_total: DataTypes.INTEGER,
    plans_dom_id: DataTypes.INTEGER,
    plans_en_id: DataTypes.INTEGER,
    plans_remarks: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    tableName: 'plans_mstr',
    timestamps: false,
    modelName: 'PlansMstr',
  });
  return PlansMstr;
};