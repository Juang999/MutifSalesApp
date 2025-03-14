const {Router} = require('express');
const router = Router();
const {index, getProductWithGetDescQty, detail, getDetailProductWithGetDescQty} = require('../../app/controllers/Client/ProductV3Controller');

router.get('/', index);
router.get('/:product_code/detail', detail);
router.get('/getdesc-qty', getProductWithGetDescQty);
router.get('/getdesc-qty/:product_code/detail', getDetailProductWithGetDescQty);

module.exports = router;