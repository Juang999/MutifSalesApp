const {Router} = require('express');
const router = Router();
const {insertNewStock} = require('../../app/controllers/System/StockController');

router.post('/insert', insertNewStock);

module.exports = router;