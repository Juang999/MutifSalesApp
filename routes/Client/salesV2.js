const {Router} = require('express');
const router = Router();
const {getChart, getLimitedCart} = require('../../app/controllers/Client/SalesV2Controller');
const {Middleware, Requests} = require('../../app/Kernel')

router.get('/chart/', [Middleware.AuthMiddleware], getChart);
router.get('/chart-limited', [Middleware.AuthMiddleware], getLimitedCart);

module.exports = router;