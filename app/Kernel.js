class Kernel {
    constructor () {
        return {
            Middleware: {
                AuthMiddleware: require('./middleware/AuthMiddleware'),
                CheckLoginMiddleware: require('./middleware/CheckLoginMiddleware'),
            },
            Requests: {
                SalesRequests: {
                    InputChartRequest: require('./requests/SalesRequests/InputChartRequest'),
                }
            }
        }
    }
}

module.exports = new Kernel();