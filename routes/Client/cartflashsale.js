const { Router } = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel');
const { 
    readyToCheckout,
    deleteChart, updateChart, 
    inputIntoChart, getDataChart, 
} = require('../../app/controllers/Client/CartFlashSaleController');
const { checkOut } = require('../../app/controllers/Client/CheckOutFlashSaleController');

router.get('/', [Middleware.AuthMiddleware], getDataChart);
router.get('/ready-to-checkout', [Middleware.AuthMiddleware], readyToCheckout);
router.delete('/:product_id/delete', [Middleware.AuthMiddleware], deleteChart);
router.post('/checkout', [Middleware.AuthMiddleware, Requests.SalesRequests.CheckoutRequest], checkOut);
router.post('/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/:cart_oid/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);

module.exports = router;