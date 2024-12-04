const {Router} = require('express');
const router = Router();
const {index, store} = require('../../app/controllers/Client/PreOrderController');
const {Middleware, Requests} = require('../../app/Kernel');

router.get('/', [Middleware.AuthMiddleware], index);
router.post('/store', [Middleware.AuthMiddleware], store);

module.exports = router;