const {Router} = require('express');
const router = Router();
const {index, getProductWithGetDescQty, detail, getDetailProductWithGetDescQty} = require('../../app/controllers/Client/ProductV3Controller');
const {Middleware} = require('../../app/Kernel');

router.get('/', [Middleware.CheckLoginMiddleware], index);
router.get('/:product_code/detail', detail);
router.get('/getdesc-qty', [Middleware.CheckLoginMiddleware], getProductWithGetDescQty);
router.get('/getdesc-qty/:product_code/detail', getDetailProductWithGetDescQty);

module.exports = router;