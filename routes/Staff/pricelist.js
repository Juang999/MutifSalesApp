const { Router } = require('express');
const router = Router();
const { index, update } = require('../../app/controllers/Staff/PriceController');
const AdminMiddleware = require('../../app/middleware/AdminMiddleware');

router.get('/pricelist-name', index);
router.patch('/:pricelist_oid/update-pricelist', [AdminMiddleware], update);

module.exports = router;