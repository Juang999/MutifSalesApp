const { Router } = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel');
const { 
    readyToCheckout,
    deleteChart, updateChart, 
    inputIntoChart, getDataChart, 
} = require('../../app/controllers/Client/CartFlashSaleController');
const { checkOut } = require('../../app/controllers/Client/CheckOutFlashSaleController');

router.get('/', [Middleware.AuthMiddleware, Middleware.FlashSaleMiddleware], getDataChart);
router.get('/ready-to-checkout', [Middleware.AuthMiddleware, Middleware.FlashSaleMiddleware], readyToCheckout);
router.delete('/:product_id/delete', [Middleware.AuthMiddleware, Middleware.FlashSaleMiddleware], deleteChart);
router.post('/checkout', [Middleware.AuthMiddleware, Middleware.FlashSaleMiddleware, Requests.SalesRequests.CheckoutRequest], checkOut);
router.post('/input', [Middleware.AuthMiddleware, Middleware.FlashSaleMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/:cart_oid/update', [Middleware.AuthMiddleware, Middleware.FlashSaleMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);

module.exports = router;