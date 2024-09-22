const {Router} = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel')
const {invoiceNumberSequence, getDetailInvoiceNumber, getInvoiceNumber} = require('../../app/controllers/Client/OrderController');
const {inputIntoChart, getDataChart, updateChart, deleteChart, readyToCheckout, checkOut, updatePaymentStatus} = require('../../app/controllers/Client/SalesController');

router.get('/chart/', [Middleware.AuthMiddleware], getDataChart);
router.get('/invoice-number', [Middleware.AuthMiddleware], getInvoiceNumber);
router.get('/ready-to-checkout', [Middleware.AuthMiddleware], readyToCheckout);
router.delete('/chart/:cs_oid/delete', [Middleware.AuthMiddleware], deleteChart);
router.get('/invoice-number-sequence', [Middleware.AuthMiddleware], invoiceNumberSequence);
router.get('/invoice-number/:invoice/detail', [Middleware.AuthMiddleware], getDetailInvoiceNumber);
router.post('/checkout', [Middleware.AuthMiddleware, Requests.SalesRequests.CheckoutRequest], checkOut);
router.post('/chart/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/chart/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);
router.patch('/payment-status/:invoice/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdatePaymentStatusRequest], updatePaymentStatus);

module.exports = router;