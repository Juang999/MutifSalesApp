class Kernel {
    constructor () {
        return {
            Middleware: {
                AuthMiddleware: require('./middleware/AuthMiddleware'),
                CheckLoginMiddleware: require('./middleware/CheckLoginMiddleware'),
            },
            Requests: {
                SalesRequests: {
                    CheckoutRequest: require('./requests/SalesRequests/CheckoutRequest'),
                    InputChartRequest: require('./requests/SalesRequests/InputChartRequest'),
                    UpdateChartRequest: require('./requests/SalesRequests/UpdateChartRequest'),
                }
            }
        }
    }
}

module.exports = new Kernel();