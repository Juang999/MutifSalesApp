const {Router} = require('express');
const router = Router();
const {getDistributor, getDistributorPartner, getOrderPartner, getLimitAndDeposit, getDetailSalesOrder, getDataPartner} = require('../../app/controllers/Client/PartnerController');
const {Middleware, Requests} = require('../../app/Kernel');

router.get('/distributor', getDistributor);
router.get('/:entity_id/partners', getDataPartner);
router.get('/distributor/:ptnr_id/order-agent', getOrderPartner);
router.get('/distributor/:ptnr_id/partners', getDistributorPartner);
router.get('/distributor/:so_oid/detail-sales-order', getDetailSalesOrder);
router.get('/limit-credit-deposit', [Middleware.AuthMiddleware], getLimitAndDeposit);

module.exports = router;