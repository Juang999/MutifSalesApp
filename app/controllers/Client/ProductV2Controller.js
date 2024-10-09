const {Op} = require('sequelize')
const Page = require('../../../helper/Page');
const {getData} = require('../../../helper/ProductUrl');
const {error: errorLog} = require('../../../helper/Logging');
const {getData: urlGetData} = require('../../../helper/ProductStock');
const {
    ProductJubelio, 
    PtMstr, EnMstr, 
    PiddDet, PiMstr,
    InvcMstr, PidDet, 
    PtCatMstr, Sequelize, 
    ProductJubelioThumbnail,
} = require('../../../models');
const {getStock, bulkGetStock} = require('../../modules/Stock/controllers/StockProductController');

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
            } = await this.getDataProducts(req.query)
            let result = await this.addQuantityProducts(data)

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
        Promise.all([getStock(req.params.pt_code), this.getDataDetailProduct(req.params.pt_code), this.getDescProduct(req.params.pt_code)])
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
                        status_product: (stockProduct.quantity == 0) ? 'barang tidak ada' : 'barang ada',
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
        let {page, limit, offset} = new Page(currentPage, 15);
        let categoryId = ('categories' in query) ? (query.categories != '') ? query.categories : null : null;

        let {count, rows} = await PidDet.findAndCountAll({
            attributes: [
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.col('"product"."pt_code"'), 'product_code'],
                [Sequelize.col('"product->entity_product"."en_desc"'), 'entity'],
                [Sequelize.col('"product->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal('CAST("singular_detail_price_list"."pidd_price" AS BIGINT)'), 'price'],
                [Sequelize.literal('CAST("singular_detail_price_list"."pidd_disc" AS BIGINT)'), 'discount'],
                [Sequelize.literal(`CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NULL THEN NULL ELSE "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" END`), 'thumbnail']
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
                    ],
                    where: this.conditionProduct(search, categoryId)
                }, {
                    model: PiMstr.scope('priceListBersukaCita'),
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

    conditionProduct = (searchName, productCategoryId) => {
        let condition = {
            [Op.or]: [
                {pt_desc1: {[Op.iLike]: (searchName) ? `%${searchName}%` : '%%'}},
                {pt_code: {[Op.iLike]: (searchName) ? `%${searchName}%` : '%%'}},
            ],
            pt_id: {
                [Op.in]: Sequelize.literal(`(SELECT invc_pt_id FROM public.invc_mstr WHERE invc_loc_id IN (10001, 200010, 30008))`)
            }
        };

        if (productCategoryId) {
            condition.pt_cat_id = productCategoryId;
        }

        return condition;
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
                        model: InvcMstr.scope('gudangBarangJadi'),
                        as: 'singular_product_quantity',
                        attributes: [],
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
                                model: PiddDet.scope('creditPaymentType'),
                                as: 'singular_detail_price_list',
                                attributes: [],
                            }, {
                                model: PiMstr.scope('priceListBersukaCita'),
                                as: 'master_price_list',
                                attributes: [],
                            }
                        ]
                    }
                ],
                where: {
                    pt_code: productCode
                },
                logging: false
            })
    
            console.info(result)

            return result;
        } catch (error) {
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
}

module.exports = new ProductV2Controller();