const {Router} = require('express');
const router = Router();
const {getDistributor, getDistributorPartner} = require('../../app/controllers/Client/PartnerController');
const {Middleware, Requests} = require('../../app/Kernel');

router.get('/distributor', getDistributor);
router.get('/distributor/:ptnr_id/partners', getDistributorPartner);

module.exports = router;