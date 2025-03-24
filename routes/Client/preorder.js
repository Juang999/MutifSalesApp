const {Router} = require('express');
const router = Router();
const {index, store, destroy} = require('../../app/controllers/Client/PreOrderController');
const {Middleware, Requests} = require('../../app/Kernel');

router.get('/', [Middleware.AuthMiddleware], index);
router.post('/store', [Middleware.AuthMiddleware, Requests.PreOrderRequest.inputIntoCartRequest], store);
router.delete('/:product_id/delete', [Middleware.AuthMiddleware], destroy);

module.exports = router;