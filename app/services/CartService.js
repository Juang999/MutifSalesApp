const {
    TransStatus,
    PiddDet, TConfUser,
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PtnraAddr, PtnracCntc, 
    InvctTable, sequelize,
    RegKecMstr, RegKelMstr,
    RegPropMstr, RegCityMstr,
    PtMstr, PidDet, Sequelize,
} = require('../../models');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const {Op} = require('sequelize');
const {insertBulkQuery, insertQuery} = require('../../helper/InputQueryIntoSqlOut');

class CartService {
    retrieveDataCart = async (userId, preOrder) => {
        let result = await ChartSales.scope('showCart').findAll({
            attributes: [
                ['cs_pt_id', 'product_id'],
                ['cs_pt_en_id', 'entity_id'],
                [Sequelize.col(`"product"."pt_desc1"`), 'product_name'],
                [Sequelize.col(`"product"."pt_code"`), 'product_code'],
                [Sequelize.literal('CAST(SUM(cs_qty) AS INTEGER)'), 'chart_quantity'],
                [Sequelize.literal('(SELECT * FROM ambil_data(cs_pt_id, cs_pt_en_id))'), 'available_quantity'],
                [Sequelize.literal(`CASE WHEN (SELECT * FROM ambil_data(cs_pt_id, cs_pt_en_id)) - SUM(CAST(cs_qty AS INTEGER)) < 0 THEN 'melebihi stock' ELSE 'bisa dibeli' END`), 'sales_status'],
                [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), 'price'],
                [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`CASE WHEN (SELECT * FROM ambil_data(cs_pt_id, cs_pt_en_id)) - SUM(cs_qty) < 0 THEN false ELSE true END`), 'can_be_sold'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/detail/', "product"."pt_code", '.jpg')`), 'photo'],
                [Sequelize.col(`cs_trans_id`), 'transaction_code'],
                [Sequelize.col(`"status_transaction"."trans_desc"`), 'transaction_status'],
                [Sequelize.literal('MAX(cs_created_at)'), 'created_at'],
            ],
            include: [
                {
                    model: PtMstr,
                    as: 'product',
                    attributes: [],
                    include: [
                        {
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
                        },
                    ]
                }, {
                    model: TransStatus,
                    as: 'status_transaction',
                    attributes: []
                }
            ],
            where: {
                cs_userid: userId,
                cs_preorder: preOrder,
                cs_trans_id: {
                    [Op.in]: ['D', 'E']
                },
                cs_deleted_at: {
                    [Op.eq]: null
                }
            },
            group: [
                'cs_pt_id',
                'product_name',
                'product_code',
                'photo',
                'price',
                'discount',
                'entity_id',
                'transaction_code',
                'transaction_status',
            ],
            // logging: false
        })

        return result;
    }

    getDataCartByInventoryOid = async (inventoryOid, userId) => {
        let result = await ChartSales.findAll({
            attributes: ['cs_oid', 'cs_invc_oid', 'cs_qty'],
            where: {
                cs_invc_oid: {
                    [Op.in]: inventoryOid
                },
                cs_userid: userId
            }
        })

        return result;
    }

    retrieveDataCartThatShouldBeExpired = async (userId, preOrder) => {
        let result = await ChartSales.findAll({
            attributes: [
                'cs_oid',
                'cs_invc_oid',
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'cs_qty']
            ],
            where: [
                Sequelize.where(Sequelize.col(`cs_userid`), {
                    [Op.eq]: userId
                }),
                Sequelize.where(Sequelize.col(`cs_preorder`), {
                    [Op.eq]: preOrder
                }),
                Sequelize.where(Sequelize.col(`cs_trans_id`), {
                    [Op.not]: 'E'
                }),
                Sequelize.where(Sequelize.literal(`cs_created_at + INTERVAL '72 hours'`), {
                    [Op.lte]: moment().format('YYYY-MM-DD HH:mm:ss')
                })
            ],
            logging: false
        })

        return result;
    }

    retrieveDataToCheckout = async (userId, transId, preOrder) => {
        let result = await TConfUser.findOne({
                    attributes: [
                        [Sequelize.col('"detail_partner"."ptnr_id"'), 'ptnr_id'],
                        [Sequelize.literal('"detail_partner"."ptnr_name"'), 'ptnr_name'],
                        [Sequelize.literal(`CONCAT("detail_partner->singular_partner_address"."ptnra_line_3", ', ', "detail_partner->singular_partner_address"."ptnra_line_2", ', ', "detail_partner->singular_partner_address"."ptnra_line_1")`), 'ptnr_address'],
                        [Sequelize.literal(`"detail_partner->singular_partner_address->singular_contact_address"."ptnrac_phone_1"`), 'phone'],
                        [Sequelize.literal(`"detail_partner->singular_partner_address->singular_contact_address"."ptnrac_email"`), 'email'],
                        [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_prov_id"'), 'prop_id'],
                        [Sequelize.col('"detail_partner->singular_partner_address->singular_province"."prop_name"'), 'prop_name'],
                        [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_city_id"'), 'kota_id'],
                        [Sequelize.col(`"detail_partner->singular_partner_address->singular_city"."kota_name"`), 'kota_name'],
                        [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_kec_id"'), 'kec_id'],
                        [Sequelize.col(`"detail_partner->singular_partner_address->singular_kecamatan"."kec_name"`), 'kec_name'],
                        [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_kel_id"'), 'kel_id'],
                        [Sequelize.col(`"detail_partner->singular_partner_address->singular_kelurahan"."kel_name"`), 'kel_name']
                    ],
                    include: [
                        {
                            model: PtnrMstr,
                            as: 'detail_partner',
                            attributes: [],
                            include: [
                                {
                                    model: PtnraAddr,
                                    as: 'singular_partner_address',
                                    attributes: [],
                                    include: [
                                        {
                                            model: PtnracCntc,
                                            as: 'singular_contact_address',
                                            attributes: []
                                        }, {
                                            model: RegPropMstr,
                                            as: 'singular_province',
                                            attributes: []
                                        }, {
                                            model: RegCityMstr,
                                            as: 'singular_city',
                                            attributes: []
                                        }, {
                                            model: RegKecMstr,
                                            as: 'singular_kecamatan',
                                            attributes: []
                                        }, {
                                            model: RegKelMstr,
                                            as: 'singular_kelurahan',
                                            attributes: []
                                        }
                                    ]
                                }
                            ]
                        }, {
                            model: ChartSales,
                            as: 'chart_sales',
                            attributes: [
                                'cs_oid',
                                [Sequelize.literal('"chart_sales->product"."pt_desc1"'), 'product_name'],
                                [Sequelize.literal('"chart_sales->product"."pt_code"'), 'product_code'],
                                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'chart_quantity'],
                                [Sequelize.literal('CAST(SUM("chart_sales->qty_location"."invc_qty_available") AS INTEGER)'), 'available_quantity'],
                                [Sequelize.literal(`CAST("chart_sales->product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                                [Sequelize.literal(`ROUND("chart_sales->product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                                [Sequelize.literal(`CASE WHEN "chart_sales->product"."pt_weight" IS NULL THEN 600 ELSE CAST("chart_sales->product"."pt_weight" AS INTEGER) END`), 'pt_weight']
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
                                                    model: PiMstr.scope('priceListDistributor'),
                                                    as: 'master_price_list',
                                                    attributes: [],
                                                }, {
                                                    model: PiddDet.scope('creditPaymentType'),
                                                    as: 'singular_detail_price_list',
                                                    attributes: [],
                                                }
                                            ]
                                        }
                                    ],
                                    where: {
                                        pt_shown: 'Y'
                                    }
                                }, {
                                    model: InvcMstr.scope(`gudangSesuaiDenganEntitas`),
                                    as: 'qty_location',
                                    attributes: [],
                                }
                            ],
                            where: {
                                cs_preorder: preOrder,
                                cs_trans_id: transId,
                            }
                        }
                    ],
                    where: {
                        userid: userId
                    },
                    group: [
                        'userid',
                        Sequelize.col('"detail_partner"."ptnr_id"'),
                        Sequelize.col('"detail_partner"."ptnr_name"'),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_line_3"'),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_line_2"'),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_line_1"'),
                        Sequelize.col('"detail_partner->singular_partner_address->singular_contact_addr"."ptnrac_phone_1"'),
                        Sequelize.col('"detail_partner->singular_partner_address->singular_contact_addr"."ptnrac_email"'),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_prov_id"'),
                        Sequelize.col('"detail_partner->singular_partner_address->singular_province"."prop_name"'),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_city_id"'),
                        Sequelize.col(`"detail_partner->singular_partner_address->singular_city"."kota_name"`),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_kec_id"'),
                        Sequelize.col(`"detail_partner->singular_partner_address->singular_kecamatan"."kec_name"`),
                        Sequelize.col('"detail_partner->singular_partner_address"."ptnra_kel_id"'),
                        Sequelize.col(`"detail_partner->singular_partner_address->singular_kelurahan"."kel_name"`),
                        Sequelize.col('"chart_sales"."cs_oid"'),
                        Sequelize.literal('"chart_sales->product"."pt_desc1"'),
                        Sequelize.literal('"chart_sales->product"."pt_code"'),
                        Sequelize.literal('"chart_sales->product->singular_relation_price_list->singular_detail_price_list"."pidd_price"'),
                        Sequelize.literal('"chart_sales->product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"'),
                        Sequelize.literal('"chart_sales->product"."pt_weight"')
                    ],
                    logging: false
                })

        return result;
    }

    retrieveLimitedDataCart = async (userid, transId, preOrder) => {
        let result = await ChartSales.findAll({
            attributes: [
                ['cs_pt_id', 'product_id'],
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.literal('CAST(SUM(cs_qty) AS INTEGER)'), 'quantity'],
                [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/detail/', "product"."pt_code", '.jpg')`), 'photo'],
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
                                    model: PiMstr.scope('priceListDistributor'),
                                    as: 'master_price_list',
                                    attributes: [],
                                }, {
                                    model: PiddDet.scope('creditPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: [],
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                cs_userid: userid,
                cs_preorder: preOrder,
                cs_trans_id: transId,
            },
            group: [
                'product_id',
                'product_name',
                'price',
                'discount',
                'photo',
            ],
            limit: 15,
            logging: false
        })

        return result;
    }

    retrieveDataCartByProductId = async (productId, userId, preOrder) => {
        let result = await ChartSales.scope('showCart').findAll({
            attributes: [
                'cs_oid',
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'cs_qty'],
                'cs_invc_oid',
                'cs_trans_id'
            ],
            where: {
                cs_pt_id: productId,
                cs_userid: userId,
                cs_preorder: preOrder,
            }
        })

        return result;
    }

    getSubTotalPriceCart = async (userid, transId, preOrder) => {
        let [subTotal] = await sequelize.query(`
            SELECT 
                CAST(SUM("cs_qty" * ("detail_price_list"."pidd_price" - ("detail_price_list"."pidd_price" * "detail_price_list"."pidd_disc"))) AS BIGINT) 
            FROM public.chart_sales CS
            LEFT JOIN public.pt_mstr AS product ON product.pt_id = CS.cs_pt_id
            LEFT JOIN public.pid_det AS relation_price_list ON relation_price_list.pid_pt_id = product.pt_id
            LEFT JOIN public.pi_mstr AS master_price_list ON master_price_list.pi_oid = relation_price_list.pid_pi_oid
            LEFT JOIN public.pidd_det AS detail_price_list ON detail_price_list.pidd_pid_oid = relation_price_list.pid_oid
            WHERE cs_userid = :userid
            AND master_price_list.pi_id IN (103, 202, 304)
            AND detail_price_list.pidd_payment_type = 9942
            AND cs_trans_id = :transId
            AND cs_preorder = :preOrder
            `, {
                replacements: {
                    userid,
                    transId,
                    preOrder
                },
                logging: false
            })

        return subTotal;
    }

    getDataHeaderSalesQuotation = async (userId, preOrder) => {
        let result = await ChartSales.findAll({
            attributes: [
                'cs_pt_en_id',
                'cs_pi_id',
                [Sequelize.literal(`"qty_location"."invc_loc_id"`), 'loc_id'],
                [Sequelize.literal(`CASE WHEN cs_pt_en_id = 1 THEN 10004 WHEN cs_pt_en_id = 2 THEN 20009 WHEN cs_pt_en_id = 3 THEN 300017 END`), 'loc_git'],
                [Sequelize.literal(`ROUND(MAX("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"), 2)`), 'discount'],
                [Sequelize.literal(`CAST(SUM((cs_qty * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price") - (cs_qty * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2))) AS INTEGER)`), 'total_price']
            ],
            include: [
                {
                    model: InvcMstr,
                    as: 'qty_location',
                    attributes: []
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
                                    model: PiddDet.scope(`creditPaymentType`),
                                    as: 'singular_detail_price_list',
                                    attributes: []
                                }
                            ],
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('cs_userid'), {
                        [Op.eq]: userId
                    }),
                    Sequelize.where(Sequelize.col('cs_trans_id'), {
                        [Op.eq]: 'D'
                    }),
                    Sequelize.where(Sequelize.col('cs_preorder'), {
                        [Op.eq]: preOrder
                    }),
                    Sequelize.where(Sequelize.col(`"product->singular_relation_price_list"."pid_pi_oid"`), {
                        [Op.eq]: Sequelize.literal(`(SELECT pi_oid FROM public.pi_mstr WHERE pi_id = cs_pi_id)`)
                    })
                ]
            },
            group: [
                'loc_id',
                'loc_git',
                'cs_pi_id',
                'cs_pt_en_id',
            ],
            logging: false
        })

        return result;
    }

    getDataDetailSalesQuotation = async (userId, preOrder) => {
        let dataProducts = await ChartSales.findAll({
            attributes: [
                'cs_oid',
                'cs_pt_id',
                ['cs_pt_en_id', 'en_id'],
                [Sequelize.literal(`CAST("cs_qty" * "product->singular_table_cost"."invct_cost" AS BIGINT)`), 'total_cost'],
                [Sequelize.literal(`CAST(("cs_qty" * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price") - ("cs_qty" * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * "product->singular_relation_price_list->singular_detail_price_list"."pidd_disc") AS BIGINT)`), 'total_price'],
                [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal('CAST(cs_qty AS BIGINT)'), 'cs_qty'],
                'cs_invc_oid',
                [Sequelize.literal(`"qty_location"."invc_loc_id"`), 'location_id'],
            ],
            include: [
                {
                    model: InvcMstr,
                    as: 'qty_location',
                    attributes: []
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
                                    model: PiddDet.scope('creditPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: [],
                                }, {
                                    model: PiMstr.scope('priceListDistributor'),
                                    as: 'master_price_list',
                                    attributes: []
                                }
                            ]
                        }, {
                            model: InvctTable,
                            as: 'singular_table_cost',
                            attributes: []
                        }
                    ]
                }
            ],
            where: {
                cs_userid: userId,
                cs_preorder: preOrder,
                cs_trans_id: 'D',
            },
            logging: false
        })

        return dataProducts;
    }

    findDataCart = async (productId, inventoryOid, userId) => {
        let result = await ChartSales.findOne({
            attributes: [
                'cs_oid',
                'cs_qty',
                'cs_trans_id'
            ],
            where: {
                cs_pt_id: productId,
                cs_invc_oid: inventoryOid,
                cs_userid: userId,
                cs_preorder: 'N',
                cs_trans_id: 'D',
            }
        })

        return result;
    }

    findDataCartByOid = async (cartSalesOid, transId, preOrder, userId) => {
        let result = await ChartSales.findOne({
            attributes: [
                'cs_oid',
                'cs_invc_oid',
                'cs_qty',
            ],
            where: {
                cs_oid: cartSalesOid,
                cs_userid: userId,
                cs_preorder: preOrder,
                cs_trans_id: transId,
            }
        })

        return result;
    }

    getDetailDataCart = async (productId, userId, preOrder) => {
        let result = await ChartSales.findOne({
            attributes: [
                'cs_pt_id',
                'cs_pt_en_id',
                'cs_pi_id',
                [Sequelize.literal('CAST(SUM(cs_qty) AS INTEGER)'), 'cs_qty']
            ],
            where: {
                cs_pt_id: productId,
                cs_userid: userId,
                cs_preorder: preOrder,
                cs_trans_id: 'E',
            },
            group: [
                'cs_oid',
                'cs_pt_id'
            ]
        })

        return result;
    }

    inputIntoCart = async (body, dataUser, preOrder, transaction) => {
        let result = await ChartSales.create({
            cs_oid: uuidv4(),
            cs_userid: dataUser.userid,
            cs_pt_id: body.productId,
            cs_pt_en_id: body.entityId,
            cs_invc_oid: body.inventoryOid,
            cs_qty: body.quantity,
            cs_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_pi_id: body.priceListId,
            cs_created_by: dataUser.username,
            cs_updated_by: dataUser.username,
            cs_trans_id: 'D',
            cs_preorder: preOrder
        }, {
            individualHooks: true,
            transaction,
            logging: (sqlCommand, {bind}) => {
                let realSql = sqlCommand.split(": ")[1];

                insertQuery(realSql, bind, 1);
            }
        })

        return result;
    }

    updateCart = async (cartSalesOid, quantity, transId, transaction) => {
        console.info(transId)
        let result = await ChartSales.update({
            cs_qty: quantity,
            cs_trans_id: transId,
            cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        }, {
            where: {
                cs_oid: cartSalesOid
            },
            transaction,
            individualHooks: true,
            logging: (sqlCommand, {bind}) => {
                let realSql = sqlCommand.split(": ")[1];

                insertQuery(realSql, bind, 1);
            }
        })

        return result;
    }

    deleteDataCart = async (cartSalesOid, dataUser, transaction) => {
        await ChartSales.update({
            cs_trans_id: Sequelize.literal(`CASE WHEN cs_trans_id != 'E' THEN 'X' ELSE 'E' END`),
            cs_deleted_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_deleted_by: dataUser.userName
        }, {
            where: {
                cs_oid: cartSalesOid,
                cs_userid: dataUser.userId
            },
            transaction,
            individualHooks: true,
            logging: (sqlCommamd, {bind}) => {
                let realSql = sqlCommamd.split(': ')[1];

                insertQuery(realSql, bind, 2);
            },
        })
    }

    bulkDeleteDataCart = async (dataCartSales, dataUser, transaction) => {
        let CART_SALES_OID = dataCartSales.map(({dataValues}) => dataValues.cs_oid);

        await ChartSales.update({
            cs_trans_id: 'C',
            cs_deleted_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_deleted_by: dataUser.userName
        }, {
            where: {
                cs_oid: {
                    [Op.in]: CART_SALES_OID
                },
                cs_userid: dataUser.userId
            },
            logging: false,
            transaction: transaction,
            individualHooks: true
        })
    }

    bulkDeleteDataCart2 = async (productId, dataUser, transaction) => {
        console.info(dataUser.userid)
        await ChartSales.update({
            cs_trans_id: Sequelize.literal(`CASE WHEN cs_trans_id != 'E' THEN 'X' ELSE 'E' END`),
            cs_deleted_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_deleted_by: dataUser.userName
        }, {
            where: {
                cs_userid: dataUser.userid,
                cs_trans_id: 'E',
                cs_pt_id: productId
            },
            logging: false,
            individualHooks: true
        })
    }
}

module.exports = new CartService();