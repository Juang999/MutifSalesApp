const {devEnvironment, testEnvironment, proEnvironment} = require('./environment')

module.exports = {
    development: {
        username: devEnvironment.parsed.DB_GETDESC_USERNAME,
        password: devEnvironment.parsed.DB_GETDESC_PASSWORD,
        database: devEnvironment.parsed.DB_GETDESC_DATABASE,
        host: devEnvironment.parsed.DB_GETDESC_HOST,
        port: devEnvironment.parsed.DB_GETDESC_PORT,
        dialect: devEnvironment.parsed.DB_GETDESC_DIALECT,
        timezone: devEnvironment.parsed.DB_GETDESCE_TIMEZONE,
    pool: {
        max: parseInt(devEnvironment.parsed.DB_MAX_CONN),
        min: parseInt(devEnvironment.parsed.DB_MIN_CONN),
        idle: parseInt(devEnvironment.parsed.DB_IDLE_CONN),
        acquire: parseInt(devEnvironment.parsed.DB_ACQUIRE_CONN)
    }
    },
    testing: {
        username: testEnvironment.parsed.DB_GETDESC_USERNAME,
        password: testEnvironment.parsed.DB_GETDESC_PASSWORD,
        database: testEnvironment.parsed.DB_GETDESC_DATABASE,
        host: testEnvironment.parsed.DB_GETDESC_HOST,
        port: testEnvironment.parsed.DB_GETDESC_PORT,
        dialect: testEnvironment.parsed.DB_GETDESC_DIALECT,
        timezone: testEnvironment.parsed.DB_GETDESCE_TIMEZONE,
        pool: {
            max: parseInt(testEnvironment.parsed.DB_MAX_CONN),
            min: parseInt(testEnvironment.parsed.DB_MIN_CONN),
            idle: parseInt(testEnvironment.parsed.DB_IDLE_CONN),
            acquire: parseInt(testEnvironment.parsed.DB_ACQUIRE_CONN)
        }

    },
    production: {
        username: proEnvironment.parsed.DB_GETDESC_USERNAME,
        password: proEnvironment.parsed.DB_GETDESC_PASSWORD,
        database: proEnvironment.parsed.DB_GETDESC_DATABASE,
        host: proEnvironment.parsed.DB_GETDESC_HOST,
        port: proEnvironment.parsed.DB_GETDESC_PORT,
        dialect: proEnvironment.parsed.DB_GETDESC_DIALECT,
        timezone: proEnvironment.parsed.DB_GETDESCE_TIMEZONE,
        pool: {
            max: parseInt(proEnvironment.parsed.DB_MAX_CONN),
            min: parseInt(proEnvironment.parsed.DB_MIN_CONN),
            idle: parseInt(proEnvironment.parsed.DB_IDLE_CONN),
            acquire: parseInt(proEnvironment.parsed.DB_ACQUIRE_CONN)
        }
    }
}