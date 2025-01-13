const Sequelize = require('sequelize');
const {config} = require('../../../../config/environment');

const nodeEnv = config.parsed.NODE_ENV || 'development';
const environment = require('../config/database')[nodeEnv];

const sequelize = new Sequelize(environment.database, environment.username, environment.password, environment)

module.exports = {
    sequelize,
    Sequelize
}