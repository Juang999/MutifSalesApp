const {
    PtMstr, PidDet,
    PiddDet, InvcMstr,
    Wishlist,Sequelize,
} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const {inputSalesPlans, deleteProductSalesPlans} = require('./CreateSalesPlansHelper');

class PreOrderService {
    retrieveDataPreOrder = async (userId) => {
        let result = await Wishlist.findAll({
                        attributes: [
                            'wl_oid',
                            [Sequelize.col('"product"."pt_desc_jubelio"'), 'product_name'],
                            [Sequelize.col('"product"."pt_code"'), 'product_code'],
                            [Sequelize.literal('CAST(wl_qty AS BIGINT)'), 'wishlist_quantity'],
                            [Sequelize.literal('CAST("inventory_product"."invc_qty_available" AS BIGINT)'), 'available_quantity'],
                            [Sequelize.literal(`CASE WHEN wl_qty > "inventory_product"."invc_qty_available" THEN 'permintaan melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                            [Sequelize.literal(`CASE WHEN wl_qty > "inventory_product"."invc_qty_available" THEN false ELSE true END`), 'can_be_sold`'],
                            [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), "unit_price"],
                            [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * wl_qty AS BIGINT)`), "total_price"],
                            [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), "discount"],
                            [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', "product"."pt_code", '.jpg')`), 'photo'],
                            ['wl_created_at', 'created_at'],
                            ['wl_updated_at', 'updated_at'],
                            ['wl_status', 'status']
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
                                    }
                                ]
                            }, {
                                model: InvcMstr.scope('gudangReguler'),
                                as: 'inventory_product',
                                attributes: []
                            }
                        ],
                        where: {
                            [Op.and]: [
                                Sequelize.where(Sequelize.col('wl_user_id'), {
                                    [Op.eq]: userId,
                                }),
                                Sequelize.where(Sequelize.col('"product->singular_relation_price_list"."pid_pi_oid"'), {
                                    [Op.eq]: Sequelize.literal(`(SELECT pi_oid FROM public.pi_mstr WHERE pi_id = wl_pi_id)`)
                                }),
                                Sequelize.where(Sequelize.col(`wl_is_po`), {
                                    [Op.eq]: true
                                })
                            ]
                        },
                        logging: false
                    })

        return result;
    }
}

module.exports = new PreOrderService();