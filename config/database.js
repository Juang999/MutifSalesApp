/**
 * config for Virtual Private Server
*/
const {parsed: devEnvironment} = require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.development'});
const {parsed: testEnvironment} = require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.testing'});
const {parsed: proEnvironment} = require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.production'});

/**
 * config for local windows
*/
// const {parsed: devEnvironment} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.development'});
// const {parsed: testEnvironment} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.testing'});
// const {parsed: proEnvironment} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.production'});

module.exports = {
    development: {
        "username": devEnvironment.DB_USERNAME,
        "password": devEnvironment.DB_PASSWORD,
        "database": devEnvironment.DB_DATABASE,
        "host": devEnvironment.DB_HOST,
        "port": devEnvironment.DB_PORT,
        "dialect": devEnvironment.DB_DIALECT
    },
    testing: {
        "username": testEnvironment.DB_USERNAME,
        "password": testEnvironment.DB_PASSWORD,
        "database": testEnvironment.DB_DATABASE,
        "host": testEnvironment.DB_HOST,
        "port": testEnvironment.DB_PORT,
        "dialect": testEnvironment.DB_DIALECT
    },
    production: {
        "username": proEnvironment.DB_USERNAME,
        "password": proEnvironment.DB_PASSWORD,
        "database": proEnvironment.DB_DATABASE,
        "host": proEnvironment.DB_HOST,
        "port": proEnvironment.DB_PORT,
        "dialect": proEnvironment.DB_DIALECT
    }
}