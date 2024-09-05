const {Router} = require('express');
const router = Router();
const {index, getCategories, getSuggest} = require('../../app/controllers/Client/ProductController');
const CheckLoginMiddleware = require('../../app/middleware/CheckLoginMiddleware');

router.get('/', index);
router.get('/categories', getCategories);
router.get('/suggest', CheckLoginMiddleware, getSuggest);

module.exports = router;