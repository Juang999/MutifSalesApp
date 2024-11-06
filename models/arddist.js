'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ArdDist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ArdDist.init({
    ard_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    ard_ar_oid: DataTypes.UUID,
    ard_tax_distribution: DataTypes.STRING,
    ard_taxable: DataTypes.STRING,
    ard_tax_class_id: DataTypes.INTEGER,
    ard_ac_id: DataTypes.INTEGER,
    ard_sb_id: DataTypes.INTEGER,
    ard_cc_id: DataTypes.INTEGER,
    ard_amount: DataTypes.INTEGER,
    ard_remarks: DataTypes.STRING,
    ard_dt: DataTypes.DATE,
    ard_tax_inc: DataTypes.STRING
  }, {
    sequelize,
    tableName: 'ard_dist',
    timestamps: false,
    schema: 'public',
    modelName: 'ArdDist',
  });
  return ArdDist;
};