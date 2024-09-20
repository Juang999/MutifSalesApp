'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvctTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InvctTable.init({
    invct_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    invct_dom_id: DataTypes.INTEGER,
    invct_pt_id: DataTypes.INTEGER,
    invct_date: DataTypes.DATE,
    invct_qty: DataTypes.INTEGER,
    invct_cost: DataTypes.INTEGER,
    invct_lead: DataTypes.INTEGER,
    invct_weight: DataTypes.INTEGER,
    invct_en_id: DataTypes.INTEGER,
    invct_si_id: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    tableName: 'invct_table',
    timestamps: false,
    modelName: 'InvctTable',
  });
  return InvctTable;
};