const {Router} = require('express')
const router = Router();
const {getProduct, getDetailProduct} = require('../../app/controllers/Client/ProductV2Controller');

router.get('/', getProduct);
router.get('/:pt_code/detail', getDetailProduct);

module.exports = router;