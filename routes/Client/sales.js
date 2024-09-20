const {Router} = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel')
const {inputIntoChart, getDataChart, updateChart, deleteChart, readyToCheckout, checkOut} = require('../../app/controllers/Client/SalesController');
const {invoiceNumber} = require('../../app/controllers/Client/OrderController');

router.get('/chart/', [Middleware.AuthMiddleware], getDataChart);
router.get('/invoice-number', [Middleware.AuthMiddleware], invoiceNumber);
router.get('/ready-to-checkout', [Middleware.AuthMiddleware], readyToCheckout);
router.delete('/chart/:cs_oid/delete', [Middleware.AuthMiddleware], deleteChart);
// router.get('/invoice-number/:invoice/detail', [Middleware.AuthMiddleware], getDetailInvoiceNumber);
router.post('/checkout', [Middleware.AuthMiddleware, Requests.SalesRequests.CheckoutRequest], checkOut);
router.post('/chart/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/chart/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);

module.exports = router;