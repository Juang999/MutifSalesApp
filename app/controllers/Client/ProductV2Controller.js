const axios = require('axios');
const {Op} = require('sequelize');
const Page = require('../../../helper/Page');
const {getData} = require('../../../helper/ProductUrl');
const {error: errorLog} = require('../../../helper/Logging');
const {getData: urlGetData} = require('../../../helper/ProductStock');
const {
    InvcdDet,
    ProductJubelio, 
    PtMstr, EnMstr, 
    PiddDet, PiMstr,
    InvcMstr, PidDet, 
    PtCatMstr, Sequelize, 
    ProductJubelioThumbnail,
} = require('../../../models');
const {getStock, bulkGetStock} = require('../../modules/Stock/controllers/StockProductController');
const {config} = require('../../../config/environment');

class ProductV2Controller {
    getProduct = async (req, res) => {
        try {
            let {
                data, 
                per_page, 
                last_page, 
                total_page,
                total_data, 
                current_page, 
            } = await this.getProducts(req.query)

            let result = await this.getImages(data);

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
        Promise.all([this.getDataDetailProduct(req.params.pt_code), this.getDescProduct(req.params.pt_code), this.getImageSingular(req.params.pt_code)])
        .then(([{dataValues: masterData}, descProduct, dataImage]) => {

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    // data: masterData
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
                        photo: dataImage,
                        invc_oid: masterData.invc_oid,
                        quantity: parseInt(masterData.quantity),
                        status_product: (parseInt(masterData.quantity) == 0) ? 'barang tidak ada' : 'barang ada',
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

    getDataProducts = async (query) => {
        let currentPage = ('page' in query) ? query.page : 1;
        let search = ('search' in query) ? query.search : '';
        let {page, limit, offset} = new Page(currentPage, 20);

        let {count, rows} = await PidDet.findAndCountAll({
            attributes: [
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.literal('"product"."pt_code"'), 'product_code'],
                [Sequelize.col('"product->entity_product"."en_desc"'), 'entity'],
                [Sequelize.col('"product->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal('CAST("singular_detail_price_list"."pidd_price" AS BIGINT)'), 'price'],
                [Sequelize.literal('CAST("singular_detail_price_list"."pidd_disc" AS BIGINT)'), 'discount'],
                // [Sequelize.literal(`CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NULL THEN NULL ELSE "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" END`), 'thumbnail'],
                [Sequelize.literal(`CAST(SUM("product->detail_quantity"."invcd_qty") AS INTEGER)`), 'qty'],
            ],
            include: [
                {
                    model: PtMstr,
                    as: 'product',
                    attributes: [],
                    required: true,
                    include: [
                        {
                            model: EnMstr,
                            as: 'entity_product',
                            attributes: []
                        }, {
                            model: PtCatMstr,
                            as:'master_category',
                            attributes: []
                        }, {
                            model: InvcdDet.scope('gudangReguler', 'isVerified'),
                            as: 'detail_quantity',
                            attributes: [],
                        }
                    ],
                    where: {
                        pt_desc1: {
                            [Op.iLike]: (search) ? `%${search}%` : '%%'
                        }
                    }
                }, {
                    model: PiMstr.scope('priceListDistributor'),
                    as: 'master_price_list',
                    attributes: [],
                }, {
                    model: PiddDet.scope('creditPaymentType'),
                    as: 'singular_detail_price_list',
                    attributes: [],
                }
            ],
            limit,
            offset,
            order: [[Sequelize.col('"product"."pt_desc1"'), 'ASC']],
            logging: false,
            group: [
                'pid_oid',
                Sequelize.col('"product"."pt_desc1"'),
                Sequelize.col('"product"."pt_code"'),
                Sequelize.col('"product->entity_product"."en_desc"'),
                Sequelize.col('"product->master_category"."ptcat_desc"'),
                Sequelize.col('"singular_detail_price_list"."pidd_price"'),
                Sequelize.col('"singular_detail_price_list"."pidd_disc"'),
            ]
        })

        return {
            data: rows,
            total_data: count.length, 
            per_page: rows.length,
            current_page: page, 
            last_page: Math.ceil(count.length/limit), 
            total_page: Math.ceil(count.length/limit)
        };
    }

    getDataDetailProduct = async (productCode) => {
        try {
            let result = InvcdDet.findOne({
                attributes: [
                    [Sequelize.col('"detail_inventory"."pt_id"'), 'product_id'],
                    [Sequelize.col('"detail_inventory"."pt_desc1"'), 'product_name'],
                    [Sequelize.col('"detail_inventory"."pt_code"'), 'product_code'],
                    [Sequelize.col('"detail_inventory"."pt_en_id"'), 'pt_en_id'],
                    [Sequelize.literal("COUNT(invcd_qty)"), 'quantity'],
                    [Sequelize.col(`"detail_inventory->singular_product_quantity"."invc_oid"`), 'invc_oid'],
                    [Sequelize.col(`"detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_price"`), 'price'],
                    [Sequelize.col(`"detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`), 'discount'],
                    [Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_desc"`), 'pricelist_name'],
                    [Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_id"`), 'pi_id'],
                    [Sequelize.literal(`CAST("detail_inventory"."pt_weight" AS INTEGER)`), 'product_weight'],
                    [Sequelize.literal(`CAST("detail_inventory"."pt_height" AS INTEGER)`), 'product_height'],
                    [Sequelize.literal(`CAST("detail_inventory"."pt_width" AS INTEGER)`), 'product_width'],
                    [Sequelize.literal(`CAST("detail_inventory"."pt_length" AS INTEGER)`), 'product_length'],
                ],
                include: [
                    {
                        model: PtMstr,
                        as: 'detail_inventory',
                        attributes: [],
                        include: [
                            {
                                model: EnMstr,
                                as: 'entity_product',
                                attributes: []
                            }, {
                                model: InvcMstr.scope('gudangReguler'),
                                as: 'singular_product_quantity',
                                attributes: []
                            }, {
                                model: PidDet,
                                as: 'singular_relation_price_list',
                                attributes: [],
                                include: [
                                    {
                                        model: PiMstr.scope('priceListDistributor'),
                                        as: 'master_price_list',
                                        attributes: []
                                    }, {
                                        model: PiddDet.scope('creditPaymentType'),
                                        as: 'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: [
                    Sequelize.where(Sequelize.col('"detail_inventory"."pt_code"'), {
                        [Op.eq]: productCode
                    }),
                    Sequelize.where(Sequelize.col('"invcd_qty"'), {
                        [Op.not]: 0
                    }),
                    Sequelize.where(Sequelize.col('"invcd_is_verified"'), {
                        [Op.eq]: 'Y'
                    }),
                    Sequelize.where(Sequelize.col('"invcd_is_booked"'), {
                        [Op.is]: null
                    }),
                ],
                group: [
                    Sequelize.col('"detail_inventory"."pt_id"'),
                    Sequelize.col('"detail_inventory"."pt_desc1"'),
                    Sequelize.col('"detail_inventory"."pt_code"'),
                    Sequelize.col('"detail_inventory"."pt_en_id"'),
                    Sequelize.col(`"detail_inventory->singular_product_quantity"."invc_oid"`),
                    Sequelize.col(`"detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_price"`),
                    Sequelize.col(`"detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`),
                    Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_desc"`),
                    Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_id"`),
                    Sequelize.col(`"detail_inventory"."pt_weight"`),
                    Sequelize.col(`"detail_inventory"."pt_height"`),
                    Sequelize.col(`"detail_inventory"."pt_width"`),
                    Sequelize.col(`"detail_inventory"."pt_length"`),
                ]
            })

            return result;
        } catch (error) {
            console.info(error.message)
            return error.message
        }
    }

    addQuantityProducts = async (dataProducts) => {
        let productCodes = dataProducts.map(({dataValues}) => dataValues.product_code);
        let getStocks = await bulkGetStock(productCodes);

        let result = dataProducts.map(({dataValues}) => {
            let dataStock = getStocks.find(({dataValues: dataStock}) => dataStock.qr == dataValues.product_code)

            return {
                    product_name: dataValues.product_name,
                    product_code: dataValues.product_code,
                    entity: dataValues.entity,
                    category: dataValues.category,
                    price: dataValues.price,
                    discount: dataValues.discount,
                    qty: (dataStock) ? dataStock.dataValues.quantity : 0,
                    status_product: (dataStock) ? (dataStock.dataValues.quantity == 0 ) ? 'barang tidak ada' : 'barang ada' : 'barang tidak ada',
                    thumbnail: dataValues.thumbnail
            }
        })

        return result;
    }

    getDetailStockProduct = async (ptCode) => {
        let result = await urlGetData(`/product/${ptCode}/detail`);

        return result;
    }

    getDescProduct = async (ptCode) => {
        let {data} = await getData(`/exapro/${ptCode}/description`)

        return data;
    }

    getImages = async (product) => {
        let partnumbers = product.map(({dataValues: item}) => {
            return item.product_code
        })
        
        const {parsed: configATPO} = config;
        let {data} = await axios.post(`${configATPO.URL_ATPO}/clothes/picture/bulk`, {
            partnumbers: partnumbers
        });

        let result = product.map(({dataValues: item}) => {
            let picture = data.data.filter((itemPicture) => itemPicture.partnumber == item.product_code)

            return {
                product_name: item.product_name,
                product_code: item.product_code,
                entity: item.entity,
                category: item.category,
                price: item.price,
                thumbnail: (picture.length == 0) ? null : picture[0]['picture'],
                discount: item.discount,
                qty: item.qty
            }
        })

        return result;
    }

    getImageSingular = async (productCode) => {
        try {
            let {data} = await axios.get(`${config.parsed.URL_ATPO}/clothes/picture/${productCode}/detail`);

            return (data.data != null) ? data.data.picture : null;
        } catch (error) {
            console.info(error)
        }
    }

    getProducts = async (query) => {
        try {
            let currentPage = ('page' in query) ? query.page : 1;
            let search = ('search' in query) ? query.search : '';
            let {page, limit, offset} = new Page(currentPage, 20);
    
            let {count, rows} = await InvcdDet.findAndCountAll({
                attributes: [
                    [Sequelize.col('"detail_inventory"."pt_desc1"'), 'product_name'],
                    [Sequelize.col('"detail_inventory"."pt_code"'), 'product_code'],
                    [Sequelize.col('"detail_inventory->entity_product"."en_desc"'), 'entity'],
                    [Sequelize.literal('CAST("detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)'), 'price'],
                    [Sequelize.literal('ROUND("detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                    [Sequelize.col('"detail_inventory->master_category"."ptcat_desc"'), 'category'],
                    [Sequelize.literal('CAST(COUNT(invcd_qty) AS INTEGER)'), 'qty'],
                ],
                include: [
                    {
                        model: PtMstr,
                        as: 'detail_inventory',
                        attributes: [],
                        include: [
                            {
                                model: EnMstr,
                                as: 'entity_product',
                                attributes: [],
                            }, {
                                model: PtCatMstr,
                                as: 'master_category',
                                attributes: []
                            }, {
                                model: PidDet,
                                as: 'singular_relation_price_list',
                                attributes: [],
                                include: [
                                    {
                                        model: PiMstr.scope('priceListDistributor'),
                                        as: 'master_price_list',
                                        attributes: [],
                                    }, {
                                        model: PiddDet.scope('creditPaymentType'),
                                        as: 'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col(`"detail_inventory"."pt_desc1"`), {
                            [Op.iLike]: `%${search}%`
                        }),
                        Sequelize.where(Sequelize.col('"invcd_is_verified"'), {
                            [Op.eq]: 'Y'
                        }),
                        Sequelize.where(Sequelize.col('"invcd_qty'), {
                            [Op.not]: 0
                        }),
                        Sequelize.where(Sequelize.col('"invcd_is_booked'), {
                            [Op.is]: null
                        })
                    ],
                    [Op.or]: [
                        {
                            invcd_en_id: 1,
                            invcd_loc_id: 1000555,
                        }, {
                            invcd_en_id: 2,
                            invcd_loc_id: 2000556,
                        }, {
                            invcd_en_id: 3,
                            invcd_loc_id: 3000557,
                        }
                    ]
                },
                group: [
                    Sequelize.col('"detail_inventory"."pt_desc1"'),
                    Sequelize.col('"detail_inventory"."pt_code"'),
                    Sequelize.col('"detail_inventory->entity_product"."en_desc"'),
                    Sequelize.col('"detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_price"'),
                    Sequelize.col('"detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_disc"'),
                    Sequelize.col('"detail_inventory->master_category"."ptcat_desc"')
                ],
                limit,
                offset,
                order: [
                    [Sequelize.col('"detail_inventory"."pt_code"'), 'ASC']
                ],
                logging: false
            })

            return {
                data: rows,
                total_data: count.length, 
                per_page: rows.length,
                current_page: page, 
                last_page: Math.ceil(count.length/limit), 
                total_page: Math.ceil(count.length/limit)
            }
        } catch (error) {
            return error.message;
        }
    }
}

module.exports = new ProductV2Controller();