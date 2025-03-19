const {devEnvironment, testEnvironment, proEnvironment} = require('./environment')

module.exports = {
    development: {
        username: devEnvironment.parsed.DB_USERNAME,
        password: devEnvironment.parsed.DB_PASSWORD,
        database: devEnvironment.parsed.DB_DATABASE,
        host: devEnvironment.parsed.DB_HOST,
        port: devEnvironment.parsed.DB_PORT,
        dialect: devEnvironment.parsed.DB_DIALECT,
        timezone: devEnvironment.parsed.DB_TIMEZONE,
        logging: false,
        pool: {
            max: parseInt(devEnvironment.parsed.DB_MAX_CONN),
            min: parseInt(devEnvironment.parsed.DB_MIN_CONN),
            idle: parseInt(devEnvironment.parsed.DB_IDLE_CONN),
            acquire: parseInt(devEnvironment.parsed.DB_ACQUIRE_CONN)
        }
    },
    testing: {
        username: testEnvironment.parsed.DB_USERNAME,
        password: testEnvironment.parsed.DB_PASSWORD,
        database: testEnvironment.parsed.DB_DATABASE,
        host: testEnvironment.parsed.DB_HOST,
        port: testEnvironment.parsed.DB_PORT,
        dialect: testEnvironment.parsed.DB_DIALECT,
        timezone: testEnvironment.parsed.DB_TIMEZONE,
        logging: false,
        pool: {
            max: parseInt(testEnvironment.parsed.DB_MAX_CONN),
            min: parseInt(testEnvironment.parsed.DB_MIN_CONN),
            idle: parseInt(testEnvironment.parsed.DB_IDLE_CONN),
            acquire: parseInt(testEnvironment.parsed.DB_ACQUIRE_CONN)
        }

    },
    production: {
        username: proEnvironment.parsed.DB_USERNAME,
        password: proEnvironment.parsed.DB_PASSWORD,
        database: proEnvironment.parsed.DB_DATABASE,
        host: proEnvironment.parsed.DB_HOST,
        port: proEnvironment.parsed.DB_PORT,
        dialect: proEnvironment.parsed.DB_DIALECT,
        timezone: proEnvironment.parsed.DB_TIMEZONE,
        logging: false,
        pool: {
            max: parseInt(proEnvironment.parsed.DB_MAX_CONN),
            min: parseInt(proEnvironment.parsed.DB_MIN_CONN),
            idle: parseInt(proEnvironment.parsed.DB_IDLE_CONN),
            acquire: parseInt(proEnvironment.parsed.DB_ACQUIRE_CONN)
        }
    }
}