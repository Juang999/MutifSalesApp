const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {ProductService, PriceService, InventoryService, GetDescService} = require('../../services/ServiceContainer');
const {v4: uuidv4} = require('uuid')

class ProductV3Controller {
    index = (req, res) => {
        let {ptnrg_id} = Auth.user();
        let partnerGroupId = 9912;

        if (ptnrg_id != null) {
            partnerGroupId = ptnrg_id;
        }

        ProductService.getProduct(req.query, partnerGroupId, 'N')
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

    indexFlashSale = (req, res) => {
        let {ptnrg_id} = Auth.user();
        let partnerGroupId = 9916;

        if (ptnrg_id != null) {
            partnerGroupId = ptnrg_id;
        }

        ProductService.getProductFlashSale(req.query, partnerGroupId)
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
            errorLog('GET PRODUCT FLASH SALE JUMBO', err.message);

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
            GetDescService.getAllDataV2(search),
            PriceService.getAllPriceGetDesc()
        ])
        .then(([dataProduct, dataPrice]) => {
            let result = dataProduct.map((item) => {
                let [priceProduct] = dataPrice.filter(({dataValues: singularPrice}) => singularPrice.pt_id == item.product_id)

                return {
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_code: item.product_code,
                    thumbnail: item.thumbnail,
                    entity: item.entity,
                    category: item.category,
                    price: (priceProduct) ? priceProduct.dataValues.price : 0,
                    discount: (priceProduct) ? priceProduct.dataValues.discount : 0,
                    qty: item.qty
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
            let {ptnrg_id} = Auth.user();
            let partnerGroupId = 9912;
    
            if (ptnrg_id != null) {
                partnerGroupId = ptnrg_id;
            }

            let dataProduct = await ProductService.getDetailProduct(req.params)

            if (!dataProduct) {
                res.status(404)
                    .json({
                        status: 'not found',
                        message: 'not found',
                        data: null,
                        error: 'not found'
                    });

                return;
            }

            let dataPrice = await PriceService.getPrice(dataProduct.dataValues.product_id, dataProduct.dataValues.pt_en_id, partnerGroupId, 'N')

            if (!dataPrice) {
                res.status(404)
                    .json({
                        status: 'not found',
                        message: 'not found',
                        data: null,
                        error: 'not found'
                    });

                return;
            }

            let result = {
                flashsale: dataProduct.dataValues.flashsale,
                product_id: dataProduct.dataValues.product_id,
                product_name: dataProduct.dataValues.product_name,
                product_code: dataProduct.dataValues.product_code,
                pt_en_id: dataProduct.dataValues.pt_en_id,
                pricelist_name: dataPrice.dataValues.pricelist_name,
                pi_id: dataPrice.dataValues.pi_id,
                price: dataPrice.dataValues.price,
                discount: dataPrice.dataValues.discount,
                photo: `https://cdn.mutif.biz.id/detail/${dataProduct.dataValues.product_code}.jpg`,
                product_weight: dataProduct.dataValues.product_weight,
                product_height: dataProduct.dataValues.product_height,
                product_width: dataProduct.dataValues.product_width,
                product_length: dataProduct.dataValues.product_length,
                product_quantity: dataProduct.dataValues.product_quantity.map(({dataValues}) => dataValues)
            }

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            await errorLog('GET DETAIL PRODUCT', `USER: ${Auth.user().usernama} | GROUP: ${Auth.user().groupid} | DETAIL ${req.params.product_code} | ${error.message}`)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    detailFlashSale = async (req, res) => {
        try {
            let {ptnrg_id} = Auth.user();
            let partnerGroupId = 9916;

            if (ptnrg_id != null) {
                partnerGroupId = ptnrg_id;
            }

            let [dataProduct, dataStock] = await Promise.all([
                ProductService.getDetailproductFlashSale(req.params.product_code),
                InventoryService.getStockByPartnumber(req.params.product_code)
            ])

            if (!dataProduct) {
                res.status(404)
                    .json({
                        status: 'not found',
                        message: 'not found',
                        data: null,
                        error: 'not found'
                    });

                return;
            }

            let dataPrice = await PriceService.getPrice(dataProduct.dataValues.product_id, dataProduct.dataValues.pt_en_id, partnerGroupId, 'Y')

            if (!dataPrice) {
                res.status(404)
                    .json({
                        status: 'not found',
                        message: 'not found',
                        data: null,
                        error: 'not found'
                    });

                return;
            }

            let result = {
                flashsale: dataProduct.dataValues.flashsale,
                product_id: dataProduct.dataValues.product_id,
                product_name: dataProduct.dataValues.product_name,
                product_code: dataProduct.dataValues.product_code,
                pt_en_id: dataProduct.dataValues.pt_en_id,
                pricelist_name: dataPrice.dataValues.pricelist_name,
                pi_id: dataPrice.dataValues.pi_id,
                price: dataPrice.dataValues.price,
                discount: dataPrice.dataValues.discount,
                photo: `https://cdn.mutif.biz.id/detail/${dataProduct.dataValues.product_code}.jpg`,
                product_weight: dataProduct.dataValues.product_weight,
                product_height: dataProduct.dataValues.product_height,
                product_width: dataProduct.dataValues.product_width,
                product_length: dataProduct.dataValues.product_length,
                product_quantity: dataStock.map(({dataValues}) => dataValues)
            }

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            await errorLog('GET DETAIL PRODUCT FLASH SALE JUMBO', `USER: ${Auth.user().usernama} | GROUP: ${Auth.user().groupid} | DETAIL ${req.params.product_code} | ${error.message}`)

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
                [dataProduct],
                dataQty
            ] = await Promise.all([
                GetDescService.getDetail(req.params.product_code),
                GetDescService.getDetailData(req.params.product_code)
            ])

            let dataPrice = null;

            if (dataProduct.product_id != null) {
                dataPrice = await PriceService.getPriceGetDesc(dataProduct.product_id);
            }

            let result = {
                product_id: dataProduct.product_id,
                product_name: dataProduct.product_name,
                product_code: dataProduct.product_code,
                pt_en_id: this.getRandomInt(1, 3),
                pricelist_name: ( dataPrice != null ) ? dataPrice.dataValues.pricelist_name : '-',
                pi_id: ( dataPrice != null ) ? dataPrice.dataValues.pi_id : this.getRandomInt(1, 1000),
                price:  ( dataPrice != null ) ? dataPrice.dataValues.price : 0,
                discount: ( dataPrice != null ) ? dataPrice.dataValues.discount : 0,
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