const axios = require('axios');
const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {getData} = require('../../../helper/ProductUrl');
const {getData: urlGetData, postData: urlPostData} = require('../../../helper/ProductStock');
const {info, error: errorLog} = require('../../../helper/Logging');
const {PtCatMstr, SoMstr, InvcMstr, PidDet, PiddDet, SodDet, PtMstr, EnMstr, Sequelize, PiMstr} = require('../../../models');
const ProductStock = require('../../../helper/ProductStock');


class ProductV2Controller {
    getProduct = async (req, res) => {
        try {
            let page = req.query.page || 1;
            let search = req.query.search || '';
            let {userid, ptnrg_id, usernama} = Auth.user();
            let partnumbers = (req.query.categories) ? await this.getPartnumberPerCategory(req.query.categories) : '';

            let {data, total_data, per_page, current_page, last_page, total_page} = await this.getProductAndStock({page, search}, {partnumbers})
            let result = await this.completingData(data, ptnrg_id)

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: {
                        data: result, 
                        total_data, 
                        per_page, 
                        current_page, 
                        last_page, 
                        total_page
                    },
                    error: null
                })
        } catch (error) {
            errorLog('GET PRODUCT', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    getProductAndStock = async (header, body) => {
        let stockProduct = await urlGetData('/product/', {
            page: (header) ? header.page : '',
            search: (header) ? header.search : '',
        }, {
            partnumbers: (body) ? body.partnumbers : ''
        });

        return stockProduct
    }

    getAttachmentDataProduct = async (ptCode, ptnrgId) => {
        try {
            let result = await PtMstr.findOne({
                    attributes: [
                        ['pt_id', 'product_id'],
                        [Sequelize.col('"entity_product"."en_desc"'), 'entity'],
                        [Sequelize.col('"master_category"."ptcat_desc"'), 'category'],
                        [Sequelize.literal(`CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                        [Sequelize.literal(`ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                    ],
                    include: [
                        {
                            model: EnMstr,
                            as: 'entity_product',
                            attributes: []
                        }, {
                            model: PtCatMstr,
                            as: 'master_category',
                            attributes: []
                        }, {
                            model: PidDet,
                            as:'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
                                    model: PiddDet,
                                    as:'singular_detail_price_list',
                                    attributes: [],
                                }, {
                                    model: PiMstr,
                                    as:'master_price_list',
                                    attributes: [],
                                    where: {
                                        pi_id: {
                                            [Op.in]: (ptnrgId == 9911) ? [103, 202, 304] : [991, 203, 302]
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    where: {
                        pt_code: ptCode
                    },
                    logging: false
                })
    
            return result;    
        } catch (error) {
            return error.message
        }
    }

    getPartnumberPerCategory = async (categoryId) => {
        let result = await PtMstr.findAll({
            attributes: [
                'pt_code'
            ],
            where: {
                pt_cat_id: categoryId
            }
        })

        return result.map(({dataValues}) => {
            return dataValues.pt_code;
        }).join(',');
    }

    completingData = async (dataProducts, ptnrgId) => {
        let result = [];

        for (const dataProduct of dataProducts) {
            let [
                imageProduct, 
                attachmentProduct
            ] = await Promise.all([
                this.getImageProduct(dataProduct.product_code), 
                this.getAttachmentDataProduct(dataProduct.product_code, ptnrgId)
            ]);

            result.push({
                product_name: dataProduct.product_name,
                product_code: dataProduct.product_code,
                entity: (attachmentProduct) ? attachmentProduct.dataValues.entity : null,
                category: (attachmentProduct) ? attachmentProduct.dataValues.category : null,
                price: (attachmentProduct) ? attachmentProduct.dataValues.price : null,
                discount: (attachmentProduct) ? attachmentProduct.dataValues.discount : null,
                qty: dataProduct.qty,
                photo: imageProduct
            })
        }

        return result;
    }

    getImageProduct = async (productCode) => {
        let {data: getImage} = await getData(`/exapro/${productCode}/image`)

        return getImage;
    }
}

module.exports = new ProductV2Controller();