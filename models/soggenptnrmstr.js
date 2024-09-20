'use strict';
const {
  Model
} = require('sequelize');
const {
  v4: uuidv4
} = require('uuid')
module.exports = (sequelize, DataTypes) => {
  class SogGenPtnrMstr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SogGenPtnrMstr.init({
    sog_gen_ptnr_mstr_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4()
    },
    sog_gen_ptnr_mstr_id: DataTypes.BIGINT,
    sog_gen_ptnr_mstr_en_id: DataTypes.INTEGER,
    sog_gen_ptnr_mstr_code: DataTypes.STRING,
    sog_gen_ptnr_mstr_name: DataTypes.STRING,
    sog_gen_ptnr_mstr_addr: DataTypes.STRING,
    sog_gen_ptnr_mstr_jbl_id: DataTypes.INTEGER,
    sog_gen_ptnr_mstr_is_cus: DataTypes.STRING
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName:'sog_gen_ptnr_mstr',
    modelName: 'SogGenPtnrMstr',
  });
  return SogGenPtnrMstr;
};