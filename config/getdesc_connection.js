const { Sequelize } = require('sequelize');
const { proEnvironment } = require('./environment.js');
const { parsed } = proEnvironment;
const data = {
    username_getdesc: parsed.DB_GETDESC_USERNAME,
    password_getdesc: parsed.DB_GETDESC_PASSWORD,
    database_getdesc: parsed.DB_GETDESC_DATABASE,
    host_getdesc: parsed.DB_GETDESC_HOST,
    port_getdesc: parsed.DB_GETDESC_PORT,
    dialect_getdesc: parsed.DB_GETDESC_DIALECT,
    timezone_getdesc: parsed.DB_GETDESC_TIMEZONE,
};

const getDescConnection = new Sequelize(data.database_getdesc, data.username_getdesc, data.password_getdesc, {
    dialect: data.dialect_getdesc,
    host: data.host_getdesc,
    port: data.port_getdesc,
    timezone: data.timezone_getdesc
})

module.exports == getDescConnection;