const { Router } = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel')
const {inputIntoChart, getDataChart, updateChart, deleteChart, readyToCheckout} = require('../../app/controllers/Client/CartSpesificPriceController');
const { checkOut } = require('../../app/controllers/Client/CheckoutSpesificPriceController');

router.get('/', [Middleware.AuthMiddleware], getDataChart);
router.post('/input', [Middleware.AuthMiddleware], inputIntoChart);
router.patch('/:cart_oid/update', [Middleware.AuthMiddleware], updateChart);
router.delete('/:product_id/delete', [Middleware.AuthMiddleware], deleteChart);

// checkout api
router.get('/ready-to-checkout', [Middleware.AuthMiddleware], readyToCheckout);
router.post('/checkout', [Middleware.AuthMiddleware, Requests.SalesRequests.CheckoutRequest], checkOut);

module.exports = router;