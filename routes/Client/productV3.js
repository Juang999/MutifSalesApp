const {Router} = require('express');
const router = Router();
const {index, getProductWithGetDescQty, detail} = require('../../app/controllers/Client/ProductV3Controller');

router.get('/', index);
router.get('/:product_code/detail', detail);
router.get('/getdesc-qty', getProductWithGetDescQty);

module.exports = router;