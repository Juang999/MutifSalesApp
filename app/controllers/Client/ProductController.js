const {
    PtMstr, EnMstr, 
    PiddDet, SodDet, 
    InvcMstr, PidDet, 
    PtCatMstr, SoMstr, 
    Sequelize, PiMstr, 
    ProductJubelioThumbnail, ProductJubelio
} = require('../../../models');
const {info, error: errorLog} = require('../../../helper/Logging');
const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const Page = require('../../../helper/Page');

class ProductController {
    index = async (req, res) => {
        try {
            let categoriesId = (req.query.categories) ? req.query.categories.split(',') : [4, 1, 5, 3, 0, 2, 7, 8, 9, 10, 11];
            let productName = (req.query.search) ? req.query.search : '';
            let {ptnrg_id} = Auth.user();
            let currentPage = (req.query.page) ? req.query.page : 1;
            let {page, limit, offset} = new Page(currentPage, 15);
            let priceList = this.getPriceListUser(ptnrg_id);
    
            let {count, rows} = await PtMstr.findAndCountAll({
                    attributes: [
                        ['pt_desc1', 'product_name'],
                        ['pt_code', 'product_code'],
                        [Sequelize.col('entity_product.en_desc'), 'entity'],
                        [Sequelize.col('master_category.ptcat_desc'), 'category'],
                        [Sequelize.literal('CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                        [Sequelize.literal('ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                        [Sequelize.literal('CAST("singular_product_quantity"."invc_qty_available" AS INTEGER)'), 'qty']
                    ],
                    include: [
                        {
                            model: PtCatMstr,
                            as: 'master_category',
                            attributes: []
                        },
                        {
                            model: InvcMstr,
                            as: 'singular_product_quantity',
                            attributes: [],
                            where: {
                                invc_loc_id: {
                                    [Op.in]: [10001, 200010, 30008]
                                },
                                invc_qty_available: {
                                    [Op.not]: 0
                                }
                            }
                        },
                        {
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
                                }
                            ],
                            where: {
                                pid_pi_oid: {
                                    [Op.in]: priceList
                                }
                            }
                        },
                        {
                            model: EnMstr,
                            as: 'entity_product',
                            attributes: []
                        }
                    ],
                    where: {
                        pt_cat_id: {
                            [Op.in]: categoriesId
                        },
                        pt_desc1: {
                            [Op.iLike]: `%${productName}%`
                        }
                    },
                    limit,
                    offset,
                    logging: false
                })

            let result = await this.getImages(rows);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        data: result,
                        total_data: count,
                        per_page: rows.length,
                        current_page: page,
                        last_page: Math.ceil(count / limit),
                        total_page: Math.ceil(count / limit)
                    },
                    error: null
                })
        } catch (error) {
            errorLog("GET PRODUCT", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    getDetailProduct = async (req, res) => {
        try {
            let {ptnrg_id} = await Auth.user();
            let priceList = this.getPriceListUser(ptnrg_id);

            let product = await PtMstr.findOne({
                attributes: [
                    ['pt_id', 'product_id'],
                    ['pt_code', 'product_code'],
                    ['pt_desc1', 'product_name'],
                    'pt_en_id',
                    [Sequelize.literal('"singular_product_quantity"."invc_oid"'), 'invc_oid'],
                    [Sequelize.literal('CAST("singular_product_quantity"."invc_qty_available" AS INTEGER)'), 'quantity'],
                    [Sequelize.literal('"singular_relation_price_list->master_price_list"."pi_desc"'), 'pricelist_name'],
                    [Sequelize.literal('"singular_relation_price_list->master_price_list"."pi_id"'), 'pi_id'],
                    [Sequelize.literal('CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                    [Sequelize.literal('ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                    [Sequelize.literal('CAST(pt_weight AS INTEGER)'), 'product_weight'],
                    [Sequelize.literal('CAST(pt_height AS INTEGER)'), 'product_height'],
                    [Sequelize.literal('CAST(pt_width AS INTEGER)'), 'product_width'],
                    [Sequelize.literal('CAST(pt_length AS INTEGER)'), 'product_length'],
                ],
                include: [
                    {
                        model: PidDet,
                        as: 'singular_relation_price_list',
                        attributes: [],
                        include: [
                            {
                                model: PiddDet,
                                as: 'singular_detail_price_list',
                                attributes: []
                            },
                            {
                                model: PiMstr,
                                as: 'master_price_list',
                                attributes: []
                            }
                        ]
                    }, {
                        model: InvcMstr,
                        as: 'singular_product_quantity',
                        attributes: []
                    }
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('pt_code'), {
                            [Op.eq]: req.params.pt_code
                        }),
                        Sequelize.where(Sequelize.literal('"singular_relation_price_list"."pid_pi_oid"'), {
                            [Op.in]: priceList
                        }),
                        Sequelize.where(Sequelize.col('"singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                            [Op.eq]: 9941
                        })
                    ]
                },
                logging: false
            })

            if (product == null) {
                res.status(404)
                    .json({
                        status: 'failed',
                        message: 'Product not found',
                        data: null,
                        error: null
                    });

                return;
            }

            let {data} = await getData(`/exapro/${product.dataValues.product_code}/description`)

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: {
                        product_id: product.dataValues.product_id,
                        product_name: product.dataValues.product_name,
                        entity_name: data.entity_name,
                        pt_en_id: product.dataValues.pt_en_id,
                        product_code: product.dataValues.product_code,
                        color: data.color,
                        material: data.material,
                        combo: data.combo,
                        special_feature: data.special_feature,
                        keyword: data.keyword,
                        description: data.description,
                        slug: data.slug,
                        group_article: data.group_article,
                        type_id: data.type_id,
                        photo: (data.photo == '-') ? null : data.photo,
                        invc_oid: product.dataValues.invc_oid,
                        quantity: product.dataValues.quantity,
                        pricelist_name: product.dataValues.pricelist_name,
                        pi_id: product.dataValues.pi_id,
                        price: product.dataValues.price,
                        discount: product.dataValues.discount,
                        product_weight: product.dataValues.product_weight,
                        product_height: product.dataValues.product_height,
                        product_widht: product.dataValues.product_width,
                        product_lenght: product.dataValues.product_length,
                    },
                    error: null
                })
        } catch (error) {
            errorLog("GET DETAIL PRODUCT", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    getCategories = (req, res) => {
        PtCatMstr.findAll({
            attributes: [
                ['ptcat_id', 'category_id'],
                ['ptcat_desc', 'category_desc']
            ],
            where: {
                ptcat_id: {
                    [Op.not]: 12
                }
            },
            order: [
                ['ptcat_id', 'asc']
            ],
            logging: false
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
            errorLog('GET CATEGORY', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getSuggest = async (req, res) => {
        try {
            const {ptnrg_id} = await Auth.user();
            // let today = moment().format('YYYY-MM-DD');
            // let thirtyDayshBefore = moment().subtract(7, 'days').format('YYYY-MM-DD');
            let today = '2024-06-05'
            let SevenDayshBefore = '2024-06-02'

            let dataSuggestion = await this.getProductSuggestion(SevenDayshBefore, today, (ptnrg_id) ? ptnrg_id : 357);
            let result = await this.getImages(dataSuggestion);

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            errorLog("GET SUGGEST PRODUCT", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
            
        }
    }

    getNewProducts = async (req, res) => {
        try {
            let {userid, ptnrg_id} = Auth.user();

            let newProducts = await PtCatMstr.findAll({
                attributes: [
                    ['ptcat_id', 'category_id'],
                    ['ptcat_desc', 'category_desc'],
                    [Sequelize.col('product.pt_desc1'), 'product_name'],
                    [Sequelize.col('"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"'), 'price'],
                    [Sequelize.col('"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"'), 'discount']
                ],
                include: [
                    {
                        model: PtMstr,
                        as: 'product',
                        attributes: [],
                        include: [
                            {
                                model: PidDet,
                                as: 'singular_relation_price_list',
                                attributes: [],
                                include: [
                                    {
                                        model: PiMstr,
                                        as: 'master_price_list',
                                        attributes: []
                                    }, {
                                        model: PiddDet,
                                        as:'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: {
                    [Op.and]: [
                        
                    ],
                    ptcat_id: {
                        [Op.not]: 12
                    }
                },
                order: [
                    ['pt_add_date', 'DESC']
                ],
                limit: 8
            })
        } catch (error) {
            
        }
    }

    getPriceListUser = (ptnrgId) => {
        let piOid;

        switch (ptnrgId) {
            case 9911:
                piOid = [
                    '80c389eb-dd3a-409c-81b3-c236e98f2c32',
                    '83415091-54cc-4fd1-8e10-0dac3561fb9c',
                    '75606dee-e498-4a5e-9858-568dfb1fb117'
                ]
                break;
            case 357:
                piOid = [
                    '6ed8e85a-aabd-4b53-b4a7-9e6878534b5c',
                    '71aac24e-246e-4837-98de-0f18f4783bf5',
                    'f71dab8c-7f65-4665-9ca3-1b7abd07312c'
                ]
                break;
            default:
                piOid = [
                    '6ed8e85a-aabd-4b53-b4a7-9e6878534b5c',
                    '71aac24e-246e-4837-98de-0f18f4783bf5',
                    'f71dab8c-7f65-4665-9ca3-1b7abd07312c'
                ]
                break;
        }

        return piOid;
    }

    getProductSuggestion = async (startDate, endDate, partnerGroupId) => {
        let result = SodDet.findAll({
            attributes: [
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.col('"product"."pt_code"'), 'product_code'],
                [Sequelize.literal('"product->master_category"."ptcat_desc"'), 'category_desc'],
                [Sequelize.literal('CAST(SUM(sod_qty_shipment) AS INTEGER)'), 'total_purchases'],
                [Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"'), 'price'],
                [Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"'), 'discount'],
            ],
            include: [
                {
                    model: SoMstr,
                    as: 'master_sales_order',
                    attributes: [],
                }, {
                    model: PtMstr,
                    as: 'product',
                    attributes: [],
                    include: [
                        {
                            model: PidDet,
                            as: 'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
                                    model: PiddDet,
                                    as: 'singular_detail_price_list',
                                    attributes: []
                                },
                                {
                                    model: PiMstr,
                                    as: 'master_price_list',
                                    attributes: []
                                }
                            ]
                        },
                        {
                            model: PtCatMstr,
                            as:'master_category',
                            attributes: []
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('"master_sales_order"."so_date"'), {
                        [Op.between]: [startDate, endDate]
                    }),
                    Sequelize.where(Sequelize.col('sod_qty_shipment'), {
                        [Op.not]: null
                    }),
                    Sequelize.where(Sequelize.col('"product->singular_relation_price_list->master_price_list"."pi_id"'), {
                        [Op.in]: (partnerGroupId == 9911) ? [103, 202, 304] : [991, 203, 302]
                    }),
                    Sequelize.where(Sequelize.col('"product->singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                        [Op.eq]: 9941
                    }),
                    Sequelize.where(Sequelize.col('"product"."pt_cat_id"'), {
                        [Op.not]: 12
                    })
                ]
            },
            group: [
                Sequelize.col('"product"."pt_desc1"'),
                Sequelize.col('"product"."pt_code"'),
                Sequelize.literal('"product->master_category"."ptcat_desc"'),
                Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"'),
                Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"')
            ],
            order: [
                ['total_purchases', 'desc']
            ],
            limit: 8,
            // logging: false
        })

        return result;
    }

    getImages = async (dataProduct) => {
        let result = [];

        for (const {dataValues} of dataProduct) {
            dataValues.photo = await this.getImageProduct(dataValues.product_code)

            result.push(dataValues)
        }

        return result;
    }

    getImageProduct = async (productCode) => {
        let {data: getImage} = await getData(`/exapro/${productCode}/image`)

        return getImage;
    }

    getProducts = async (prequisite) => {
        let search = ('search' in prequisite) ? prequisite.search : '';
        let categoryId = ('categoryId' in prequisite) ? prequisite.categoryId : null;

        let data = PidDet.findAll({
            attributes: [
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.col('"product"."pt_code"'), 'product_code'],
                [Sequelize.col('"product->entity_product"."en_desc"'), 'entity'],
                [Sequelize.col('"product->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal('CAST("singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND("singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                [Sequelize.literal(`CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NULL THEN NULL ELSE "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" END`), 'photo'],
            ],
            include: [
                {
                    model: PiddDet.scope('cashPaymentType'),
                    as: 'singular_detail_price_list',
                    attributes: []
                }, {
                    model: PiMstr.scope('priceListDistributor'),
                    as: 'master_price_list',
                    attributes: []
                }, {
                    model: PtMstr.scope([
                        {method: ['searchProduct', search]},
                        {method: ['findByCategory', categoryId]}
                    ]),
                    as: 'product',
                    attribute: [],
                    required: true,
                    include: [
                        {
                            model: PtCatMstr,
                            as: 'master_category',
                            attributes: []
                        }, {
                            model: EnMstr,
                            as: 'entity_product',
                            attributes: []
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
                        }
                    ]
                }
            ]
        })

        return data;
    }
}

module.exports = new ProductController();