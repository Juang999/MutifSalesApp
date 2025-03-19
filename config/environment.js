class Configuration {
    // path for windows
    path = 'C:/Users/user/Project'
    // path for linux
    // path = '/var/www'

    constructor () {
        return {
            config: require('dotenv').config({path: `${this.path}/MutifSalesApp/.env`}),
            devEnvironment: require('dotenv').config({path: `${this.path}/MutifSalesApp/.env.development`}),
            testEnvironment: require('dotenv').config({path: `${this.path}/MutifSalesApp/.env.testing`}),
            proEnvironment: require('dotenv').config({path: `${this.path}/MutifSalesApp/.env.production`})
        }
    }
}

module.exports = new Configuration();