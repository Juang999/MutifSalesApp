class Kernel {
    constructor () {
        return {
            Middleware: {
                AuthMiddleware: require('./middleware/AuthMiddleware'),
                CheckLoginMiddleware: require('./middleware/CheckLoginMiddleware'),
                AdminMiddleware: require('./middleware/AdminMiddleware'),
                FlashSaleMiddleware: require('./middleware/FlashSaleMiddleware')
            },
            Requests: {
                SalesRequests: {
                    CheckoutRequest: require('./requests/SalesRequests/CheckoutRequest'),
                    InputChartRequest: require('./requests/SalesRequests/InputChartRequest'),
                    UpdateChartRequest: require('./requests/SalesRequests/UpdateChartRequest'),
                    UpdatePaymentStatusRequest: require('./requests/SalesRequests/UpdatePaymentStatusRequest')
                },
                PreOrderRequest: {
                    inputIntoCartRequest: require('./requests/PreOrderRequests/StorePreOrderRequest'),
                }
            }
        }
    }
}

module.exports = new Kernel();