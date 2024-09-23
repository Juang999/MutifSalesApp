const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {getData} = require('../../../helper/ProductUrl');
const ProductStock = require('../../../helper/ProductStock');
const {info, error: errorLog} = require('../../../helper/Logging');
const {getData: urlGetData, postData: urlPostData} = require('../../../helper/ProductStock');
const {PtCatMstr, SoMstr, InvcMstr, PidDet, PiddDet, SodDet, PtMstr, EnMstr, Sequelize, PiMstr} = require('../../../models');

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

    getDetailProduct = (req, res) => {
        Promise.all([this.getDetailStockProduct(req.params.pt_code), this.getAttachmentDataProduct(req.params.pt_code), this.getDescProduct(req.params.pt_code)])
        .then(([stockProduct, {dataValues: attachmentProduct}, descProduct]) => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        product_id: attachmentProduct.product_id,
                        product_name: stockProduct.product_name,
                        entity_name: attachmentProduct.entity,
                        pt_en_id: attachmentProduct.pt_en_id,
                        product_code: stockProduct.product_code,
                        color: descProduct.color,
                        material: descProduct.material,
                        combo: descProduct.combo,
                        special_feature: descProduct.special_feature,
                        keyword: descProduct.keyword,
                        description: descProduct.description,
                        slug: descProduct.slug,
                        group_article: descProduct.group_article,
                        type_id: descProduct.type_id,
                        photo: descProduct.photo,
                        invc_oid: attachmentProduct.invc_oid,
                        quantity: stockProduct.quantity,
                        pricelist_name: attachmentProduct.pricelist_name,
                        pi_id: attachmentProduct.pi_id,
                        price: attachmentProduct.price,
                        discount: attachmentProduct.discount,
                        product_weight: attachmentProduct.product_weight,
                        product_height: attachmentProduct.product_height,
                        product_width: attachmentProduct.product_width,
                        product_lenght: attachmentProduct.product_length,
                    }
                })
        })
        .catch(err => {
            errorLog('GET DETAIL PRODUCT', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
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
                        'pt_en_id',
                        [Sequelize.col(`"singular_product_quantity"."invc_oid"`), 'invc_oid'],
                        [Sequelize.literal(`CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                        [Sequelize.literal(`ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                        [Sequelize.col(`"singular_relation_price_list->master_price_list"."pi_id"`), 'pi_id'],
                        [Sequelize.col(`"singular_relation_price_list->master_price_list"."pi_desc"`), 'pricelist_name'],
                        [Sequelize.literal('CAST(pt_weight AS INTEGER)'), 'product_weight'],
                        [Sequelize.literal('CAST(pt_height AS INTEGER)'), 'product_height'],
                        [Sequelize.literal('CAST(pt_width AS INTEGER)'), 'product_width'],
                        [Sequelize.literal('CAST(pt_length AS INTEGER)'), 'product_length'],
                    ],
                    include: [
                        {
                            model: EnMstr,
                            as: 'entity_product',
                            attributes: []
                        }, {
                            model: InvcMstr,
                            as: 'singular_product_quantity',
                            attributes: [],
                            where: {
                                invc_loc_id: {
                                    [Op.in]: [10001, 200010, 300018]
                                }
                            }
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

    getDetailStockProduct = async (ptCode) => {
        let result = await urlGetData(`/product/${ptCode}/detail`);

        return result;
    }

    getDescProduct = async (ptCode) => {
        let {data} = await getData(`/exapro/${ptCode}/description`)

        return data;
    }
}

module.exports = new ProductV2Controller();