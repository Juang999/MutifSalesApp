const {Router} = require('express');
const router = Router();
const {
    index, detail, 
    indexFlashSale, detailFlashSale, 
    indexAnotherProgram, detailAotherProgram,
    getProductWithGetDescQty, getDetailProductWithGetDescQty
} = require('../../app/controllers/Client/ProductV3Controller');
const {Middleware} = require('../../app/Kernel');

// api regular
router.get('/', [Middleware.CheckLoginMiddleware], index);
router.get('/:product_code/detail', [Middleware.CheckLoginMiddleware], detail);

// api flashsale
router.get('/flash-sale-jumbo', [Middleware.CheckLoginMiddleware], indexFlashSale);
router.get('/flash-sale-jumbo/:product_code/detail', [Middleware.CheckLoginMiddleware], detailFlashSale);

// api spesific price
router.get('/spesific-program', [Middleware.CheckLoginMiddleware], indexAnotherProgram);
router.get('/spesific-program/:product_code/detail', [Middleware.CheckLoginMiddleware], detailAotherProgram);

// api getdesc
router.get('/getdesc-qty', getProductWithGetDescQty);
router.get('/getdesc-qty/:product_code/detail', getDetailProductWithGetDescQty);

module.exports = router;