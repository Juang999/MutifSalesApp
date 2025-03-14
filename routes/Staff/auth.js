const {Router} = require('express');
const router = Router();
const {getUser, updatePartnerUser} = require('../../app/controllers/Staff/AuthController');
const {Middleware} = require('../../app/Kernel');

router.get('/user', [Middleware.AdminMiddleware], getUser);
router.patch('/user/:userid/partner-update', [Middleware.AdminMiddleware], updatePartnerUser);

module.exports = router;