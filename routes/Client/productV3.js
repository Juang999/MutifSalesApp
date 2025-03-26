const {Router} = require('express');
const router = Router();
const {index, getProductWithGetDescQty, detail, getDetailProductWithGetDescQty} = require('../../app/controllers/Client/ProductV3Controller');
const {Middleware} = require('../../app/Kernel');

router.get('/', [Middleware.CheckLoginMiddleware], index);
router.get('/:product_code/detail', [Middleware.CheckLoginMiddleware], detail);
router.get('/getdesc-qty', getProductWithGetDescQty);
router.get('/getdesc-qty/:product_code/detail', getDetailProductWithGetDescQty);

module.exports = router;