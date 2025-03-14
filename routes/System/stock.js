const {Router} = require('express');
const router = Router();
const {insertNewStock, updateStock} = require('../../app/controllers/System/StockController');

router.post('/insert', insertNewStock);
router.patch('/shipping-qty', updateStock);

module.exports = router;