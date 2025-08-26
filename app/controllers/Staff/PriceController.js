const { PriceService } = require('../../services/ServiceContainer');
const {info, error: errorLog} = require('../../../helper/Logging');

class PriceController {
    index = (req, res) => {
        let search = (req.query.price_name) ? req.query.price_name : '';

        PriceService.retrievePriceName(search)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog(`GET PRICELIST NAME`, err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    update = (req, res) => {
        const isShown = (req.body.shown == 'Y') ? 'Y' : 'N'
        const isFlashSale = (req.body.flashsale == 'Y') ? 'Y' : 'N'
        const spesificProgram = (req.body.spesific_program == 'Y') ? 'Y' : 'N'

        PriceService.updateStatusPriceList(isShown, isFlashSale, spesificProgram, req.params.pricelist_oid)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'updated',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }
}

module.exports = new PriceController();