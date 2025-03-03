const {Router} = require('express');
const router = Router();
const {index} = require('../../app/controllers/Client/ProductV3Controller');

router.get('/', index);

module.exports = router;