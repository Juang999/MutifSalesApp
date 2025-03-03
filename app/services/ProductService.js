const {
    PtMstr, EnMstr, 
    PiddDet, SodDet, 
    InvcMstr, PidDet, 
    PtCatMstr, SoMstr, 
    Sequelize, PiMstr, 
    ProductJubelioThumbnail, ProductJubelio
} = require('../../models');
const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../helper/Auth');
const Page = require('../../helper/Page');
const {getData} = require('../../helper/ProductUrl');
const {info, error: errorLog} = require('../../helper/Logging');

class ProductService {
    getProduct = async (query) => {
        let productName = (query.search) ? query.search : '';

        let raw = await InvcMstr.scope('gudangSesuaiDenganEntitas', 'isVerified').findAll({
            attributes: [
                [Sequelize.col(`product_knowledge.pt_id`), 'product_id'],
                [Sequelize.col(`product_knowledge.pt_desc1`), 'product_name'],
                [Sequelize.col(`product_knowledge.pt_code`), 'product_code'],
                [Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`), 'entity'],
                [Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal(`CAST("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`CAST(SUM(invc_qty_available) AS BIGINT)`), 'qty'],
            ],
            include: [
                {
                    model: PtMstr,
                    as: 'product_knowledge',
                    attributes: [],
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
                            model: PidDet.scope('priceListDistributor'),
                            as: 'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
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
                Sequelize.where(Sequelize.literal(`"product_knowledge"."pt_desc1"`), {
                    [Op.iLike]: `%${productName}%`
                })
            ],
            group: [
                'invc_en_id',
                Sequelize.col(`product_knowledge.pt_id`),
                Sequelize.col(`product_knowledge.pt_desc1`),
                Sequelize.col(`product_knowledge.pt_code`),
                Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`),
                Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price"`),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`)
            ],
            order: [
                ['qty', 'DESC']
            ],
        })

        let result = this.responseDataProduct(raw);

        return result;
    }

    getDetailProduct = async (param, query) => {
        try {
            let result = await PtMstr.findOne({
                attributes: [
                    ['pt_id', 'product_id'],
                    ['pt_desc1', 'product_name'],
                    ['pt_code', 'product_code'],
                    'pt_en_id',
                    // [Sequelize.literal(`"singular_relation_price_list->master_price_list"."pi_desc"`), 'pricelist_name'],
                    // [Sequelize.literal(`CAST("singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), 'price'],
                    // [Sequelize.literal(`ROUND("singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
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
                            // {
                            //     model: PiMstr.scope('priceListDistributor'),
                            //     required: false,
                            //     as: 'master_price_list',
                            //     attributes: []
                            // }, 
                            // {
                            //     model: PiddDet.scope('creditPaymentType'),
                            //     as: 'singular_detail_price_list',
                            //     attributes: []
                            // }
                        ]
                    }, 
                    {
                        model: InvcMstr.scope('FILTER_BERDASARKAN_GUDANG_BARANG_JADI_ATAU_GUDANG_REGULER'),
                        as: 'product_quantity',
                        attributes: [
                            'invc_loc_id',
                            'invc_qty_available'
                        ]
                    }
                ],
                where: {
                    pt_code: param.product_code,
                }
            })
    
            return result
        } catch (error) {
            throw new Error(error.message)
        }
    }

    responseDataProduct = (data) => {
        return data.map(({dataValues}) => {
            return {
            product_id: dataValues.product_id,
            product_name: dataValues.product_name,
            product_code: dataValues.product_code,
            entity: dataValues.entity,
            category: dataValues.category,
            price: dataValues.price,
            discount: dataValues.discount,
            thumbnail: `https://cdn.mutif.biz.id/thumbnail/${dataValues.product_code}`,
            qty: dataValues.qty
            }
        })
    }
}

module.exports = new ProductService();