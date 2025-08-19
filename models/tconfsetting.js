'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TConfSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TConfSetting.init({
    create_jurnal: DataTypes.BOOLEAN,
    server_code: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    xmpp_name: DataTypes.STRING,
    xmpp_ip: DataTypes.STRING,
    http_foto: DataTypes.STRING,
    version_code: DataTypes.STRING,
    version_id: DataTypes.STRING,
    serv_code: DataTypes.STRING,
    so_directly: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'tconfsetting',
    modelName: 'TConfSetting',
  });
  return TConfSetting;
};