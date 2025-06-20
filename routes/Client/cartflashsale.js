const { Router } = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel');
const { 
    deleteChart, updateChart, 
    inputIntoChart, getDataChart, 
} = require('../../app/controllers/Client/CartFlashSaleController');

router.get('/', [Middleware.AuthMiddleware], getDataChart);
router.delete('/:product_id/delete', [Middleware.AuthMiddleware], deleteChart);
router.post('/input', [Middleware.AuthMiddleware, Requests.SalesRequests.InputChartRequest], inputIntoChart);
router.patch('/:cart_oid/update', [Middleware.AuthMiddleware, Requests.SalesRequests.UpdateChartRequest], updateChart);

module.exports = router;