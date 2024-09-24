class Configuration {
    constructor () {
        return {
            /**
             * environment for Virtual Private Server
            */
            config: require('dotenv').config({path: '/root/Project/MutifSalesApp/.env'}),
            devEnvironment: require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.development'}),
            testEnvironment: require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.testing'}),
            proEnvironment: require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.production'})

            /**
             * environment for local Windows
            */
            // config: require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env'}),
            // devEnvironment: require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.development'}),
            // testEnvironment: require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.testing'}),
            // proEnvironment: require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.production'})
        }
    }
}

module.exports = new Configuration();