const {Router} = require('express')
const router = Router();
const {getProduct} = require('../../app/controllers/Client/ProductV2Controller');

router.get('/', getProduct);

module.exports = router;