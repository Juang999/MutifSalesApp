const {devEnvironment, testEnvironment, proEnvironment} = require('../../../../config/environment');

module.exports = {
    development: {
        username: devEnvironment.parsed.DB_STOCK_USERNAME,
        password: devEnvironment.parsed.DB_STOCK_PASSWORD,
        database: devEnvironment.parsed.DB_STOCK_DATABASE,
        host: devEnvironment.parsed.DB_STOCK_HOST,
        port: devEnvironment.parsed.DB_STOCK_PORT,
        dialect: devEnvironment.parsed.DB_STOCK_DIALECT,
    },
    testing: {
        username: testEnvironment.parsed.DB_STOCK_USERNAME,
        password: testEnvironment.parsed.DB_STOCK_PASSWORD,
        database: testEnvironment.parsed.DB_STOCK_DATABASE,
        host: testEnvironment.parsed.DB_STOCK_HOST,
        port: testEnvironment.parsed.DB_STOCK_PORT,
        dialect: testEnvironment.parsed.DB_STOCK_DIALECT,
    },
    production: {
        username: proEnvironment.parsed.DB_STOCK_USERNAME,
        password: proEnvironment.parsed.DB_STOCK_PASSWORD,
        database: proEnvironment.parsed.DB_STOCK_DATABASE,
        host: proEnvironment.parsed.DB_STOCK_HOST,
        port: proEnvironment.parsed.DB_STOCK_PORT,
        dialect: proEnvironment.parsed.DB_STOCK_DIALECT,
    }
}