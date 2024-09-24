const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../../helper/Auth');
const Page = require('../../../helper/Page');
const {getData} = require('../../../helper/ProductUrl');
const ProductStock = require('../../../helper/ProductStock');
const {info, error: errorLog} = require('../../../helper/Logging');
const {getData: urlGetData, postData: urlPostData} = require('../../../helper/ProductStock');
const {PtCatMstr, SoMstr, InvcMstr, PidDet, PiddDet, SodDet, PtMstr, EnMstr, Sequelize, PiMstr, ProductJubelio, ProductJubelioThumbnail} = require('../../../models');

class ProductV2Controller {
    getProduct = async (req, res) => {
        try {
            let {data, total_data, per_page, current_page, last_page, total_page} = await this.getDataProducts(req.query)
            let result = await this.completingData(data)

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
        Promise.all([this.getDetailStockProduct(req.params.pt_code), this.getDataDetailProduct(req.params.pt_code), this.getDescProduct(req.params.pt_code)])
        .then(([stockProduct, {dataValues: masterData}, descProduct]) => {

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        product_id: masterData.product_id,
                        product_name: masterData.product_name,
                        entity_name: descProduct.entity_name,
                        pt_en_id: masterData.pt_en_id,
                        product_code: masterData.product_code,
                        color: descProduct.color,
                        material: descProduct.material,
                        combo: descProduct.combo,
                        special_feature: descProduct.special_feature,
                        keyword: descProduct.keyword,
                        description: descProduct.description,
                        slug: descProduct.slug,
                        group_article: descProduct.group_article,
                        type_id: descProduct.type_id,
                        photo: masterData.photo,
                        invc_oid: masterData.invc_oid,
                        quantity: stockProduct.quantity,
                        pricelist_name: masterData.pricelist_name,
                        pi_id: masterData.pi_id,
                        price: masterData.price,
                        discount: masterData.discount,
                        product_weight: masterData.product_weight,
                        product_height: masterData.product_height,
                        product_width: masterData.product_width,
                        product_lenght: masterData.product_length,
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

    getDataDetailProduct = async (productCode) => {
        try {
            let result = await PtMstr.findOne({
                attributes: [
                    ['pt_id', 'product_id'],
                    ['pt_desc1', 'product_name'],
                    ['pt_code', 'product_code'],
                    'pt_en_id',
                    [Sequelize.col(`"singular_product_quantity"."invc_oid"`), 'invc_oid'],
                    [Sequelize.literal(`CASE WHEN "singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NULL THEN NULL ELSE "singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" END`), 'photo'],
                    [Sequelize.literal(`CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                    [Sequelize.literal(`ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                    [Sequelize.col(`"singular_relation_price_list->master_price_list"."pi_desc"`), 'pricelist_name'],
                    [Sequelize.col(`"singular_relation_price_list->master_price_list"."pi_id"`), 'pi_id'],
                    [Sequelize.literal(`CAST(pt_weight AS INTEGER)`), 'product_weight'],
                    [Sequelize.literal(`CAST(pt_height AS INTEGER)`), 'product_height'],
                    [Sequelize.literal(`CAST(pt_width AS INTEGER)`), 'product_width'],
                    [Sequelize.literal(`CAST(pt_length AS INTEGER)`), 'product_length'],
                ],
                include: [
                    {
                        model: InvcMstr,
                        as: 'singular_product_quantity',
                        attributes: [],
                        where: {
                            invc_loc_id: {
                                [Op.in]: [10001, 200010, 300018]
                            }
                        }
                    }, {
                        model: ProductJubelio,
                        as: 'singular_product_jubelio',
                        attributes: [],
                        include: [
                            {
                                model: ProductJubelioThumbnail,
                                as: 'singular_thumbnail_product',
                                attributes: []
                            }
                        ]
                    }, {
                        model: PidDet,
                        as: 'singular_relation_price_list',
                        attributes: [],
                        include: [
                            {
                                model: PiddDet,
                                as: 'singular_detail_price_list',
                                attributes: [],
                                where: {
                                    pidd_payment_type: 9941
                                }
                            }, {
                                model: PiMstr,
                                as: 'master_price_list',
                                attributes: [],
                                where: {
                                    pi_id: {
                                        [Op.in]: [103, 202, 304]
                                    }
                                }
                            }
                        ]
                    }
                ],
                where: {
                    pt_code: productCode
                }
            })
    
            return result;
        } catch (error) {
            return error.message
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
                        pt_code: ptCode,
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

        for (const {dataValues} of dataProducts) {
            let {quantity} = await this.getDetailStockProduct(dataValues.product_code)

            result.push({
                product_name: dataValues.product_name,
                product_code: dataValues.product_code,
                entity: dataValues.entity,
                category: dataValues.category,
                price: dataValues.price,
                discount: dataValues.discount,
                qty: quantity,
                photo: dataValues.photo
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

    getDataProducts = async (query) => {
        let currentPage = ('page' in query) ? query.page : 1;
        let search = ('search' in query) ? query.search : '';
        let {page, limit, offset} = new Page(currentPage, 15);
        let categoryId = ('category_id' in query) ? query.category_id.split(',') : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        let {count, rows} = await PtMstr.findAndCountAll({
            attributes: [
                ['pt_desc1', 'product_name'],
                ['pt_code', 'product_code'],
                [Sequelize.col('"entity_product"."en_desc"'), 'entity'],
                [Sequelize.col('"master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal(`CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`CASE WHEN "singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NULL THEN '-' ELSE "singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" END`), 'photo'],
            ],
            include: [
                {
                    model: ProductJubelio,
                    as: 'singular_product_jubelio',
                    attributes: [],
                    include: [
                        {
                            model: ProductJubelioThumbnail,
                            as: 'singular_thumbnail_product',
                            attributes: []
                        }
                    ]
                }, {
                    model: EnMstr,
                    as: 'entity_product',
                    attributes: []
                }, {
                    model: PtCatMstr,
                    as:'master_category',
                    attributes: []
                }, {
                    model: PidDet,
                    as: 'singular_relation_price_list',
                    attributes: [],
                    include: [
                        {
                            model: PiddDet,
                            as:'singular_detail_price_list',
                            attributes: [],
                            where: {
                                pidd_payment_type: 9941
                            }
                        }, {
                            model: PiMstr,
                            as:'master_price_list',
                            attributes: [],
                            where: {
                                pi_id: {
                                    [Op.in]: [103, 202, 304]
                                }
                            }
                        }
                    ],
                    where: {
                        pid_pt_id: {
                            [Op.not]: null
                        }
                    }
                }, {
                    model: InvcMstr,
                    as: 'singular_product_quantity',
                    attributes: [],
                    where: {
                        invc_loc_id: {
                            [Op.in]: [10001, 200010, 300018]
                        }
                    }
                }
            ],
            where: {
                pt_cat_id: {
                    [Op.in]: categoryId
                },
                [Op.or]: [
                    {
                        pt_desc1: {
                            [Op.iLike]: `%${search}%`
                        }
                    }, {
                        pt_code: {
                            [Op.iLike]: `%${search}%`
                        }
                    }
                ]
            },
            limit,
            offset,
            logging: false
        })

        return {
            data: rows,
            total_data: count, 
            per_page: rows.length,
            current_page: page, 
            last_page: Math.ceil(count/limit), 
            total_page: Math.ceil(count/limit)
        };
    }
}

module.exports = new ProductV2Controller();