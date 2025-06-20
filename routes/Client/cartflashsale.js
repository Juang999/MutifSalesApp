const { Router } = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel');
const { 
    deleteChart, updateChart, 
    inputIntoChart, getDataChart, 
} = require('../../app/controllers/Client/CartFlashSaleController');

router.get('/chart/', [Middleware.AuthMiddleware], getDataChart);
router.delete('/chart/:product_id/delete', [Middleware.AuthMiddleware], deleteChart);
router.post('/chart/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/chart/:cart_oid/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);

module.exports = router;