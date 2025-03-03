const { Router } = require('express');
const router = Router();
const { index, show, update } = require('../../app/controllers/Client/ShipmentController');
const {Middleware, Requests} = require('../../app/Kernel')

router.get('/', [Middleware.AuthMiddleware], index);
router.get('/:transfer_oid/detail', [Middleware.AuthMiddleware], show);
router.put('/:transfer_oid/accept', [Middleware.AuthMiddleware], update);

module.exports = router;