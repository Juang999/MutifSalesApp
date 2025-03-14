const moment = require('moment');
const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {ProductService, PriceService, GetDescService} = require('../../services/ServiceContainer');

class ProductV3Controller {
    index = (req, res) => {
        ProductService.getProduct(req.query)
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

    getProductWithGetDescQty = (req, res) => {
        let {ptnrg_id} = Auth.user();
        let currentPage = (req.query.page) ? req.query.page : 1;
        let {page, limit} = new Page(currentPage, 15);

        Promise.all([
            ProductService.getProduct(req.query),
            GetDescService.getAllData()
        ])
        .then(([dataProduct, dataQty]) => {
            let result = dataProduct.map(({dataValues: item}) => {
                let [qtyProduct] = dataQty.filter(({dataValues: singularQty}) => singularQty.qr == item.product_code)

                return {
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_code: item.product_code,
                    thumbnail: item.thumbnail,
                    entity: item.entity,
                    category: item.category,
                    price: item.price,
                    discount: item.discount,
                    qty: (qtyProduct) ? qtyProduct.dataValues.counts : 0
                }
            })

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
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

    detail = async (req, res) => {
        try {
            let {dataValues: dataProduct} = await ProductService.getDetailProduct(req.params)
            let {dataValues: dataPrice} = await PriceService.getPrice(dataProduct.product_id, dataProduct.pt_en_id)

            let result = {
                product_id: dataProduct.product_id,
                product_name: dataProduct.product_name,
                product_code: dataProduct.product_code,
                pt_en_id: dataProduct.pt_en_id,
                pricelist_name: dataPrice.pricelist_name,
                pi_id: dataPrice.pi_id,
                price: dataPrice.price,
                discount: dataPrice.discount,
                photo: `https://cdn.mutif.biz.id/detail/${dataProduct.product_code}.jpg`,
                product_weight: dataProduct.product_weight,
                product_height: dataProduct.product_height,
                product_width: dataProduct.product_width,
                product_length: dataProduct.product_length,
                product_quantity: dataProduct.product_quantity.map(({dataValues}) => dataValues)
            }

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            await errorLog('GET DETAIL PRODUCT', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }
}

module.exports = new ProductV3Controller();