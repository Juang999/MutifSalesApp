const { Router } = require('express');
const router = Router();
const { getDataSalesQuotation, getDetailDataSalesQuotation } = require('../../app/controllers/Staff/SalesQuotationController');
const AdminMiddleware = require('../../app/middleware/AdminMiddleware');

router.get('/all', [AdminMiddleware], getDataSalesQuotation);
router.get('/:sq_oid/detail', [AdminMiddleware], getDetailDataSalesQuotation);

module.exports = router;