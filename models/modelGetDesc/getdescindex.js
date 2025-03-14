const Sequelize = require('sequelize');
const {config: environment} = require('../../config/environment.js');
const env = environment.parsed.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/getdescdatabase.js')[env];

let sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = {
    sequelize,
    Sequelize
}