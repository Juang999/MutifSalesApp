const {
    PiddDet, PiMstr,
    Wishlist, PtMstr,
    InvcMstr, PidDet,
    Sequelize, sequelize,
    ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');
const Auth = require('../../../helper/Auth');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const {Op} = require('sequelize')

class WishlistController {
    index = (req, res) => {
        Wishlist.findAll({
            attributes: [
                'wl_oid',
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.col('"product"."pt_code"'), 'product_code'],
                [Sequelize.literal('CAST(wl_qty AS BIGINT)'), 'wishlist_quantity'],
                [Sequelize.literal('CAST("inventory_product"."invc_qty_available" AS BIGINT)'), 'available_quantity'],
                [Sequelize.literal(`CASE WHEN wl_qty > "inventory_product"."invc_qty_available" THEN 'permintaan melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                [Sequelize.literal(`CASE WHEN wl_qty > "inventory_product"."invc_qty_available" THEN false ELSE true END`), 'can_be_sold`'],
                [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), "unit_price"],
                [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * wl_qty AS BIGINT)`), "total_price"],
                [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), "discount"],
                [Sequelize.literal(`CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NOT NULL THEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" ELSE NULL END`), 'photo'],
                ['wl_created_at', 'created_at'],
                ['wl_updated_at', 'updated_at'],
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
                                    model: PiddDet.scope('cashPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: []
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
                }, {
                    model: InvcMstr.scope('gudangSesuaiDenganEntitas'),
                    as: 'inventory_product',
                    attributes: []
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('wl_user_id'), {
                        [Op.eq]: Auth.user().userid,
                    }),
                    Sequelize.where(Sequelize.col('"product->singular_relation_price_list"."pid_pi_oid"'), {
                        [Op.eq]: Sequelize.literal(`(SELECT pi_oid FROM public.pi_mstr WHERE pi_id = wl_pi_id)`)
                    })
                ]
            },
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
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    store = (req, res) => {
        Wishlist.create({
            wl_oid: uuidv4(),
            wl_user_id: Auth.user().userid,
            wl_pt_id: req.body.product_id,
            wl_qty: req.body.quantity,
            wl_en_id: req.body.entity_id,
            wl_invc_oid: req.body.inventory_oid,
            wl_pi_id: req.body.pricelist_id,
            wl_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            wl_updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
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

    destroy = (req, res) => {
        Wishlist.destroy({
            where: {
                wl_oid: req.params.wishlistOid,
                wl_user_id: Auth.user().userid
            },
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
}

module.exports = new WishlistController();