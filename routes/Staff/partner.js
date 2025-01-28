const {Router} = require('express');
const router = Router();
const {Middleware} = require('../../app/Kernel');
const {getPartnerName} = require('../../app/controllers/Staff/PartnerController');

router.get('/name', [Middleware.AdminMiddleware], getPartnerName);

module.exports = router;