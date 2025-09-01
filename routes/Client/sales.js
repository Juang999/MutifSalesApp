const {Router} = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel')
const {checkOut} = require('../../app/controllers/Client/CheckoutController');
const {
    invoiceNumberSequence, 
    markProduckForCheckout,
    updateChart, deleteChart, 
    inputIntoChart, getDataChart, 
    readyToCheckout, updatePaymentStatus,
    getDetailInvoiceNumber, getInvoiceNumber,
} = require('../../app/controllers/Client/SalesController');

/**
 * customer section
*/
router.post('/chart/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.get('/chart/', [Middleware.AuthMiddleware], getDataChart);
router.get('/ready-to-checkout', [Middleware.AuthMiddleware], readyToCheckout);
router.post('/checkout', [Middleware.AuthMiddleware, Requests.SalesRequests.CheckoutRequest], checkOut);
router.delete('/chart/:product_id/:spesific_program/spesific-program/delete', [Middleware.AuthMiddleware], deleteChart);
router.patch('/cart/product-id/:product_id/spesific-program/:spesific_program/mark-product', [Middleware.AuthMiddleware], markProduckForCheckout);

/**
 * payment-system section
*/
router.get('/invoice-number', [Middleware.AuthMiddleware], getInvoiceNumber);
router.get('/invoice-number-sequence', [Middleware.AuthMiddleware], invoiceNumberSequence);
router.get('/invoice-number/:invoice/detail', [Middleware.AuthMiddleware], getDetailInvoiceNumber);
router.patch('/chart/:cart_oid/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);
router.patch('/payment-status/:invoice/update', [Requests.SalesRequests.UpdatePaymentStatusRequest], updatePaymentStatus);

module.exports = router;