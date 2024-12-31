'use strict';
const {
  Model
} = require('sequelize');
const {
  v4: uuidv4
} = require('uuid');
const moment = require('moment');
const {Op} = require('sequelize');

let startOfDay = moment().format('YYYY-MM-DD 00:00:00');
let endOfDay = moment().format('YYYY-MM-DD 23:59:59');

module.exports = (sequelize, DataTypes) => {
  class TokenStorage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      TokenStorage.belongsTo(models.TConfUser, {
        as: 'user',
        targetKey: 'userid',
        foreignKey: 'token_user_id'
      })
    }
  }
  TokenStorage.init({
    token_oid: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: uuidv4()
    },
    token_user_id: DataTypes.INTEGER,
    token_token: DataTypes.STRING,
    token_desc: DataTypes.STRING,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: moment().format('YYYY-MM-DD HH:mm:ss')
    }
  }, {
    sequelize,
    schema: 'public',
    scopes: {
      oneDayLoggedIn: {
        where: {
          created_at: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      },
      mutifSalesAppDesc: {
        where: {
          token_desc: 'mutif-sales-app'
        }
      }
    },
    tableName: 'token_storage',
    timestamps: false,
    modelName: 'TokenStorage',
  });
  return TokenStorage;
};