'use strict';
const {
  Model
} = require('sequelize');
const {
  v4: uuidv4
} = require('uuid');
module.exports = (sequelize, DataTypes) => {
  class SogGenEmpMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SogGenEmpMstr.init({
    sog_gen_emp_mstr_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4()
    },
    sog_gen_emp_mstr_id: DataTypes.INTEGER,
    sog_gen_emp_mstr_en_id: DataTypes.INTEGER,
    sog_gen_emp_mstr_code: DataTypes.STRING,
    sog_gen_emp_mstr_name: DataTypes.STRING,
    sog_gen_emp_mstr_addr: DataTypes.STRING,
    sog_gen_emp_mstr_jbl_id: DataTypes.INTEGER,
    sog_gen_emp_mstr_is_emp: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName:'sog_gen_emp_mstr',
    modelName: 'SogGenEmpMstr',
  });
  return SogGenEmpMstr;
};