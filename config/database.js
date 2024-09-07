const {devEnvironment, testEnvironment, proEnvironment} = require('./environment')

module.exports = {
    development: {
        "username": devEnvironment.parsed.DB_USERNAME,
        "password": devEnvironment.parsed.DB_PASSWORD,
        "database": devEnvironment.parsed.DB_DATABASE,
        "host": devEnvironment.parsed.DB_HOST,
        "port": devEnvironment.parsed.DB_PORT,
        "dialect": devEnvironment.parsed.DB_DIALECT
    },
    testing: {
        "username": testEnvironment.parsed.DB_USERNAME,
        "password": testEnvironment.parsed.DB_PASSWORD,
        "database": testEnvironment.parsed.DB_DATABASE,
        "host": testEnvironment.parsed.DB_HOST,
        "port": testEnvironment.parsed.DB_PORT,
        "dialect": testEnvironment.parsed.DB_DIALECT
    },
    production: {
        "username": proEnvironment.parsed.DB_USERNAME,
        "password": proEnvironment.parsed.DB_PASSWORD,
        "database": proEnvironment.parsed.DB_DATABASE,
        "host": proEnvironment.parsed.DB_HOST,
        "port": proEnvironment.parsed.DB_PORT,
        "dialect": proEnvironment.parsed.DB_DIALECT
    }
}