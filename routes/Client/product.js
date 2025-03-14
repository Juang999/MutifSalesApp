const {Router} = require('express');
const router = Router();
const {index, getCategories, getSuggest, getDetailProduct} = require('../../app/controllers/Client/ProductController');
const CheckLoginMiddleware = require('../../app/middleware/CheckLoginMiddleware');

router.get('/', index);
router.get('/categories', getCategories);
router.get('/suggest', CheckLoginMiddleware, getSuggest);
router.get('/:pt_code/detail', CheckLoginMiddleware, getDetailProduct);

module.exports = router;