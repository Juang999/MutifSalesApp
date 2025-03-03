const moment = require('moment');
const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {info, error: errorLog} = require('../../../helper/Logging');
const {ProductService} = require('../../services/ServiceContainer');

class ProductV3Controller {
    index = (req, res) => {
        let {ptnrg_id} = Auth.user();
        let currentPage = (req.query.page) ? req.query.page : 1;
        let {page, limit} = new Page(currentPage, 15);

        ProductService.getProduct(req)
        .then(({count, rows}) => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        data: rows,
                        total_data: count,
                        per_page: rows.length,
                        current_page: page,
                        last_page: Math.ceil(count / limit),
                        total_page: Math.ceil(count / limit)
                    },
                    error: null
                })
        })
        .catch(err => {
            errorLog('GET PRODUCT', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: 'Server Error!'
                })
        })
    }
}

module.exports = new ProductV3Controller();