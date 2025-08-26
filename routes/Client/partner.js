const {Router} = require('express');
const router = Router();
const {Middleware, Requests} = require('../../app/Kernel');
const {
    getDataSales,
    getOrderPartner, getLimitAndDeposit, 
    getDetailSalesOrder, getDataPartner, 
    getDistributor, getDistributorPartner, 
} = require('../../app/controllers/Client/PartnerController');

router.get('/distributor', getDistributor);
router.get('/:entity_id/sales', getDataSales);
router.get('/:entity_id/partners', getDataPartner);
router.get('/distributor/:ptnr_id/order-agent', getOrderPartner);
router.get('/distributor/:ptnr_id/partners', getDistributorPartner);
router.get('/distributor/:so_oid/detail-sales-order', getDetailSalesOrder);
router.get('/limit-credit-deposit', [Middleware.AuthMiddleware], getLimitAndDeposit);

module.exports = router;