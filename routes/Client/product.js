const {Router} = require('express');
const router = Router();
const {index, getCategories} = require('../../app/controllers/Client/ProductController');

router.get('/', index);
router.get('/categories', getCategories);

module.exports = router;