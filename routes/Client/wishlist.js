const {Router} = require('express');
const router = Router();
const {
    index, store, destroy
} = require('../../app/controllers/Client/WishlistController');
const {Middleware, Requests} = require('../../app/Kernel');

router.get('/', [Middleware.AuthMiddleware], index);
router.post('/store', [Middleware.AuthMiddleware], store);
router.delete('/:wishlistOid/delete', [Middleware.AuthMiddleware], destroy);

module.exports = router;