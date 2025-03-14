const {Router} = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel')
const {getChart, getDetailDataCart, buyBack, getLimitedCart} = require('../../app/controllers/Client/SalesV2Controller');

router.get('/chart/', [Middleware.AuthMiddleware], getChart);
router.put('/buy-back', [Middleware.AuthMiddleware], buyBack);
router.get('/chart-limited', [Middleware.AuthMiddleware], getLimitedCart);
router.get('/:product_id/detail-data', [Middleware.AuthMiddleware], getDetailDataCart);

module.exports = router;