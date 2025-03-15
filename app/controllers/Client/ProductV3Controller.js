const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {ProductService, PriceService, GetDescService} = require('../../services/ServiceContainer');
const {v4: uuidv4} = require('uuid')

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
            errorLogV2('GET PRODUCT', err.message);

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
        let search = (req.query.search) ? req.query.search : ''

        Promise.all([
            GetDescService.getAllData(search),
            PriceService.getAllPriceGetDesc()
        ])
        .then(([dataProduct, dataPrice]) => {
            let result = dataProduct.map(({dataValues}) => {
                let [priceProduct] = dataPrice.filter(({dataValues: singularPrice}) => singularPrice.pt_code == dataValues.product_code)

                return {
                    product_id: this.getRandomInt(1, 1000),
                    product_name: dataValues.product_name,
                    product_code: dataValues.product_code,
                    thumbnail: dataValues.thumbnail,
                    entity: dataValues.entity,
                    category: dataValues.category,
                    price: (priceProduct) ? priceProduct.dataValues.price : 0,
                    discount: (priceProduct) ? priceProduct.dataValues.discount : 0,
                    qty: dataValues.qty
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

    getDetailProductWithGetDescQty = async (req, res) => {
        try {
            let [
                {dataValues: dataProduct},
                {dataValues: dataPrice}, 
                dataQty,
            ] = await Promise.all([
                GetDescService.getDetail(req.params.product_code),
                PriceService.getPriceGetDesc(req.params.product_code), 
                GetDescService.getDetailData(req.params.product_code)
            ])

            let result = {
                product_id: this.getRandomInt(1, 1000),
                product_name: dataProduct.product_name,
                product_code: dataProduct.product_code,
                pt_en_id: this.getRandomInt(1, 1000),
                pricelist_name: dataPrice.pricelist_name,
                pi_id: dataPrice.pi_id,
                price: dataPrice.price,
                discount: dataPrice.discount,
                photo: dataProduct.photo,
                product_weight: dataProduct.product_weight,
                product_height: dataProduct.product_height,
                product_width: dataProduct.product_width,
                product_length: dataProduct.product_length,
                product_quantity: this.showDetailStock(dataQty)
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

    showDetailStock = (data) => {
        let dataKutaluhur = data.find(({dataValues}) => dataValues.loc == 'kutaluhur')
        let dataPusat = data.find(({dataValues}) => dataValues.loc == 'pusat')

        return [
            {
                invc_oid: uuidv4(),
                data_location: "kutaluhur",
                entity: "-",
                invc_loc_id: this.getRandomInt(1, 1000),
                quantity: (dataKutaluhur) ? dataKutaluhur['dataValues']['counts'] : 0
            },
            {
                invc_oid: uuidv4(),
                data_location: "pusat",
                entity: "-",
                invc_loc_id: this.getRandomInt(1, 1000),
                quantity: (dataPusat) ? dataPusat['dataValues']['counts'] : 0
            }
        ]
    }

    getRandomInt = (min, max) => {
        min = Math.ceil(min); // Membulatkan ke atas angka minimum
        max = Math.floor(max); // Membulatkan ke bawah angka maksimum

        return Math.floor(Math.random() * (max - min + 1)) + min; // Random integer dalam rentang [min, max]
    }
}

module.exports = new ProductV3Controller();