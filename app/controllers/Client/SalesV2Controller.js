const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');
const {error: errorLog} = require('../../../helper/Logging');
const {
    PiddDet, sequelize,
    PtMstr, PidDet, Sequelize, 
    ChartSales, PiMstr, InvcMstr,
    ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');

class SalesV2Controller {
    getChart = (req, res) => {
        ChartSales.findAll({
            attributes: [
                'cs_oid',
                [Sequelize.col('product.pt_desc1'), 'product_name'],
                [Sequelize.col('product.pt_code'), 'product_code'],
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'chart_quantity'],
                [Sequelize.literal(`CAST("product->singular_product_quantity"."invc_qty_available" AS INTEGER)`), 'available_quantity'],
                [Sequelize.literal(`CASE WHEN "product->singular_product_quantity"."invc_qty_available" - "cs_qty" <= 0 THEN 'melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                [Sequelize.literal(`CASE WHEN "product->singular_product_quantity"."invc_qty_available" - "cs_qty" <= 0 THEN false ELSE true END`), 'can_be_sold'],
                [Sequelize.literal('CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                [Sequelize.literal(`CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NOT NULL THEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" ELSE NULL END`), 'photo'],
                ['cs_created_at', 'created_at'],
                ['cs_updated_at', 'updated_at'],
            ],
            include: [
                {
                    model: PtMstr,
                    as: 'product',
                    attributes: [],
                    required: true,
                    include: [
                        {
                            model: PidDet,
                            as: 'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
                                    model: PiMstr,
                                    as: 'master_price_list',
                                    attributes: [],
                                }, {
                                    model: PiddDet,
                                    as: 'singular_detail_price_list',
                                    attributes: [],
                                }
                            ]
                        }, {
                            model: InvcMstr.scope('gudangReguler'),
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
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('cs_userid'), {
                        [Op.eq]: Auth.user().userid
                    }),
                    Sequelize.where(Sequelize.col('"product->singular_relation_price_list->master_price_list"."pi_id"'), {
                        [Op.eq]: Sequelize.col('"cs_pi_id"')
                    }),
                    Sequelize.where(Sequelize.col('"product->singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                        [Op.eq]: 9942
                    }),
                ]
            },
            order: [
                ['cs_updated_at', 'desc']
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
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getLimitedCart = (req, res) => {
        Promise.all([this.getSubTotalPriceCart(Auth.user().userid), this.limitedDataCart(Auth.user().userid)])
        .then(([subTotalPrice, dataCart]) => {

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        subtotal_price: subTotalPrice[0]['sum'],
                        cart: dataCart
                    },
                    error: null
                })
        })
        .catch(err => {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    limitedDataCart = async (userid) => {
        let dataCart = await ChartSales.findAll({
            attributes: [
                'cs_oid',
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'quantity'],
                [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.col(`"product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail"`), 'photo']
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
                                    attributes: [],
                                    where: {
                                        pi_id: {
                                            [Op.in]: [1040, 2020, 3020]
                                        }
                                    }
                                }, {
                                    model: PiddDet,
                                    as: 'singular_detail_price_list',
                                    attributes: [],
                                    where: {
                                        pidd_payment_type: 9942
                                    }
                                }
                            ]
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
            ],
            where: {
                cs_userid: userid
            },
            order: [
                ['cs_qty', 'DESC']
            ],
            limit: 15,
            logging: false
        })

        return dataCart;
    }

    getSubTotalPriceCart = async (userid) => {
        let [subTotal] = await sequelize.query(`
            SELECT 
                CAST(SUM("cs_qty" * ("detail_price_list"."pidd_price" - ("detail_price_list"."pidd_price" * "detail_price_list"."pidd_disc"))) AS BIGINT) 
            FROM public.chart_sales CS
            LEFT JOIN public.pt_mstr AS product ON product.pt_id = CS.cs_pt_id
            LEFT JOIN public.pid_det AS relation_price_list ON relation_price_list.pid_pt_id = product.pt_id
            LEFT JOIN public.pi_mstr AS master_price_list ON master_price_list.pi_oid = relation_price_list.pid_pi_oid
            LEFT JOIN public.pidd_det AS detail_price_list ON detail_price_list.pidd_pid_oid = relation_price_list.pid_oid
            WHERE
                cs_userid = :userid
            AND
                master_price_list.pi_id IN (1040, 2020, 3020)
            AND
                detail_price_list.pidd_payment_type = 9942
            `, {
                replacements: {
                    userid
                },
                logging: false
            })

        return subTotal;
    }
}

module.exports = new SalesV2Controller();