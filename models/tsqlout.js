'use strict';
const {
  Model
} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class TSqlOut extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TSqlOut.init({
    sql_uid: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    seq: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    sql_command: DataTypes.STRING,
    waktu: {
      type: DataTypes.DATE,
    },
    mili_second: {
      type: DataTypes.INTEGER,
      defaultValue: 100
    },
    status_process: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    schema: 'public',
    tableName: 't_sql_out',
    timestamps: false,
    modelName: 'TSqlOut',
  });
  return TSqlOut;
};