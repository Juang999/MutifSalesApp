const { Router } = require('express');
const router = Router();
const { index, show } = require('../../app/controllers/Client/ShipmentController');
const {Middleware, Requests} = require('../../app/Kernel')

router.get('/', [Middleware.AuthMiddleware], index);
router.get('/:soship_oid/detail', [Middleware.AuthMiddleware], show);

module.exports = router;