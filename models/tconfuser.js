'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TConfUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TConfUser.belongsTo(models.PtnrMstr, {
        as: 'detail_partner',
        foreignKey: 'user_ptnr_id',
        targetKey: 'ptnr_id'
      })

      TConfUser.hasOne(models.ChartSales, {
        as: 'singular_chart_sales',
        sourceKey: 'userid',
        foreignKey: 'cs_userid'
      })

      TConfUser.hasOne(models.Wishlist, {
        as: 'singular_wishlist',
        sourceKey: 'userid',
        foreignKey: 'wl_user_id'
      })

      TConfUser.hasOne(models.Wishlist, {
      as: 'singular_pre_order',
        sourceKey: 'userid',
        foreignKey: 'wl_user_id'
      })

      TConfUser.belongsTo(models.EnMstr, {
        as: 'entity_default',
        targetKey: 'en_id',
        foreignKey: 'en_id'
      })

      TConfUser.hasMany(models.ChartSales, {
        as: 'chart_sales',
        sourceKey: 'userid',
        foreignKey: 'cs_userid'
      })
    }
  }
  TConfUser.init({
    userid: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    userkode: DataTypes.STRING,
    usernama: DataTypes.STRING,
    password: DataTypes.STRING,
    groupid: DataTypes.INTEGER,
    last_access: DataTypes.DATE,
    id_karyawan: DataTypes.INTEGER,
    time_reminder: DataTypes.INTEGER,
    en_id: DataTypes.INTEGER,
    useractive: DataTypes.STRING,
    useremail: DataTypes.STRING,
    usernik: DataTypes.STRING,
    userpidgin: DataTypes.STRING,
    userpidgin_hris: DataTypes.STRING,
    userphone: DataTypes.STRING,
    user_ptnr_id: DataTypes.INTEGER,
    user_imei: DataTypes.STRING,
    nik_id: DataTypes.STRING,
    user_ptnrg_id: DataTypes.INTEGER,
    // user_group_id: DataTypes.INTEGER,
    // username: DataTypes.STRING,
    // api_token: DataTypes.STRING,
    // created_at: DataTypes.DATE,
    // updated_at: DataTypes.DATE,
    // pin: DataTypes.STRING,
    // user_id_telegram: DataTypes.INTEGER
  }, {
    sequelize,
    schema: 'public',
    timestamps: false,
    tableName: 'tconfuser',
    modelName: 'TConfUser',
  });
  return TConfUser;
};