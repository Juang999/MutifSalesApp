const {PtCatMstr} = require('../../../models');
const {info, error: errorLog} = require('../../../helper/Logging')

class ProductController {
    index = (req, res) => {

    }

    getCategories = (req, res) => {
        PtCatMstr.findAll({
            attributes: [
                ['ptcat_id', 'category_id'],
                ['ptcat_desc', 'category_desc']
            ]
        })
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
            errorLog({feature: 'GET CATEGORY', message: err.message})

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

module.exports = new ProductController();