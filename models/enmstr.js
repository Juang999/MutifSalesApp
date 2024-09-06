'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EnMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EnMstr.init({
    en_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    en_dom_id: DataTypes.INTEGER,
    en_add_by: DataTypes.STRING,
    en_add_date: DataTypes.DATE,
    en_upd_by: DataTypes.STRING,
    en_upd_date: DataTypes.DATE,
    en_id: DataTypes.INTEGER,
    en_code: DataTypes.STRING,
    en_desc: DataTypes.STRING,
    en_parent: DataTypes.INTEGER,
    en_active: DataTypes.STRING,
    en_dt: DataTypes.DATE,
    en_limit_account: DataTypes.STRING,
    en_pi_id: DataTypes.INTEGER
  }, {
    sequelize,
    tableName: 'en_mstr',
    timestamps: false,
    schema: 'public',
    modelName: 'EnMstr',
  });
  return EnMstr;
};