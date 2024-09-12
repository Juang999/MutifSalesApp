const {Router} = require('express');
const router = Router();
const {inputIntoChart, getDataChart, updateChart, deleteChart} = require('../../app/controllers/Client/SalesController');
const {Middleware, Requests} = require('../../app/Kernel')

router.get('/chart/', [Middleware.AuthMiddleware], getDataChart);
router.delete('/chart/:cs_oid/delete', [Middleware.AuthMiddleware], deleteChart);
router.post('/chart/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/chart/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);

module.exports = router;