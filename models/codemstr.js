'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CodeMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CodeMstr.init({
    code_oid: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    code_dom_id: DataTypes.INTEGER,
    code_en_id: DataTypes.INTEGER,
    code_add_by: DataTypes.STRING,
    code_add_date: DataTypes.DATE,
    code_upd_by: DataTypes.STRING,
    code_upd_date: DataTypes.DATE,
    code_id: DataTypes.INTEGER,
    code_seq: DataTypes.INTEGER,
    code_field: DataTypes.STRING,
    code_code: DataTypes.STRING,
    code_name: DataTypes.STRING,
    code_desc: DataTypes.STRING,
    code_default: DataTypes.STRING,
    code_parent: DataTypes.INTEGER,
    code_usr_1: DataTypes.STRING,
    code_usr_2: DataTypes.STRING,
    code_usr_3: DataTypes.STRING,
    code_usr_4: DataTypes.STRING,
    code_usr_5: DataTypes.STRING,
    code_active: DataTypes.STRING,
    code_dt: DataTypes.DATE
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'code_mstr',
    modelName: 'CodeMstr',
  });
  return CodeMstr;
};