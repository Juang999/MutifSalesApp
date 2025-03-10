const {Router} = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel')
const {getChart, getExpiredDataChart, getLimitedCart} = require('../../app/controllers/Client/SalesV2Controller');

router.get('/chart/', [Middleware.AuthMiddleware], getChart);
router.get('/chart-limited', [Middleware.AuthMiddleware], getLimitedCart);
router.get('/chart-expired', [Middleware.AuthMiddleware], getExpiredDataChart);

module.exports = router;