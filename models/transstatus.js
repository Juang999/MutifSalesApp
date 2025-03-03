'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TransStatus.init({
    trans_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    trans_id: DataTypes.INTEGER,
    trans_desc: DataTypes.STRING,
    trans_wf_start: DataTypes.STRING,
    trans_dt: DataTypes.DATE
  }, {
    sequelize,
    schema: 'public',
    tableName: 'trans_status',
    timestamps: false,
    modelName: 'TransStatus',
  });
  return TransStatus;
};