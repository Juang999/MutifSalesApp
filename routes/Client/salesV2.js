const {Router} = require('express');
const router = Router();
const {getChart} = require('../../app/controllers/Client/SalesV2Controller');
const {Middleware, Requests} = require('../../app/Kernel')

router.get('/chart/', [Middleware.AuthMiddleware], getChart);

module.exports = router;