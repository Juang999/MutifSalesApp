const {Router} = require('express');
const router = Router();
const {index, detail} = require('../../app/controllers/Client/ProductV3Controller');

router.get('/', index);
router.get('/:product_code/detail', detail);

module.exports = router;