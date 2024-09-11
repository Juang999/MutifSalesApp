const {Router} = require('express');
const router = Router();
const {inputIntoChart, getDataChart} = require('../../app/controllers/Client/SalesController');
const {Middleware, Requests} = require('../../app/Kernel')

router.get('/chart/', [Middleware.AuthMiddleware], getDataChart);
router.post('/chart/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);

module.exports = router;