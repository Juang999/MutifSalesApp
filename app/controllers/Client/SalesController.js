const axios = require('axios');
const moment = require('moment');
const {Op, where} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const {config} = require('../../../config/environment');
const {error: errorLog} = require('../../../helper/Logging');
const {
    InvcdDet,
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PiddDet, TConfUser,
    PtnraAddr, PtnracCntc, 
    RegKecMstr, RegKelMstr,
    SqMstr, SogGenPtnrMstr,
    RegPropMstr, RegCityMstr,
    PtMstr, PidDet, Sequelize,
    sequelize, ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');
const {insertQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {patchData: urlPatchData} = require('../../../helper/ProductStock');
const {
    releaseProduct, updateStatusTransction, bulkReleaseQuantity, 
} = require('../../modules/Stock/controllers/StockProductController');

class SalesController {
    inputIntoChart = async (req, res) => {
        const t = await sequelize.transaction();

        try {
            let {qty: qtyNeeded, pt_id: productId, invc_oid: inventoryOid} = req.body;
            let qtyStock = await this.getStock(productId, qtyNeeded, t);
            let dataCart = await this.checkProductInChart(productId, Auth.user().userid);
            let cartSalesOid = (dataCart != null) ? dataCart.dataValues.cs_oid : uuidv4();

            let checkQtyProduct = this.checkQuantityProduct(qtyNeeded, dataCart, qtyStock);

            if (checkQtyProduct == "habis" || checkQtyProduct == "melebihi batas") {
                await t.rollback();
                let message = (checkQtyProduct == "habis") ? "barang habis terjual" : `jumlah barang tersisa ${qtyStock.invc_qty_available}`;
                res.status(300)
                    .json({
                        status: 'failed',
                        message: message,
                        data: null,
                        error: {
                            status: false
                        }
                    });

                return;
            }

            await this.decreaseQtyInventory(qtyStock, cartSalesOid, qtyStock, t);

            if (dataCart == null) {
                await this.createDataChart(cartSalesOid, Auth.user().userid, req.body, t);
            } else {
                await this.updateDataChart(cartSalesOid, parseInt(req.body.qty), dataCart.dataValues.cs_qty);
            }

            await t.commit();

            res.status(200)
                .json({
                    status: 'success', 
                    message: 'ok',
                    data: true,
                    error: null
                })
        } catch (error) {
            await t.rollback();
            errorLog('STORE CHART', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    getStock = async (ptId, limit, transaction) => {
        let data = await InvcdDet.scope('gudangReguler').findAll({
            attributes: [
                'invcd_oid',
            ],
            where: {
                invcd_pt_id: ptId,
                invcd_is_verified: 'Y'
            },
            limit,
            transaction,
            logging: false
        })

        return data;
    }

    checkProductInChart = async (ptId, userId) => {
        let data = await ChartSales.findOne({
            attributes: [
                'cs_oid',
                [Sequelize.literal('CAST("cs_qty" AS INTEGER)'), 'cs_qty']
            ],
            where: {
                cs_pt_id: ptId,
                cs_userid: userId
            },
            logging: false
        });

        return data;
    }

    createDataChart = async (cartSalesOid, userid, bodyForm, transaction) => {

        await ChartSales.create({
                cs_oid: cartSalesOid,
                cs_userid: userid,
                cs_pt_id: bodyForm.pt_id,
                cs_pt_en_id: bodyForm.en_id,
                cs_invc_oid: bodyForm.invc_oid,
                cs_qty: bodyForm.qty,
                cs_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                cs_pi_id: bodyForm.pi_id
            }, {
                individualHooks: true,
                transaction,
                logging: false
            })
    }

    updateOrInputCart = async (cartSalesOid, userid, bodyForm, dataCart) => {
        if (dataCart == null) {
            await this.createDataChart(cartSalesOid, userid, bodyForm);
        } else {
            await this.updateDataChart(cartSalesOid, parseInt(bodyForm.qty), dataCart.dataValues.cs_qty);
        }
    }

    getDataChart = (req, res) => {
        ChartSales.findAll({
            attributes: [
                'cs_oid',
                [Sequelize.col('product.pt_desc1'), 'product_name'],
                [Sequelize.col('product.pt_code'), 'product_code'],
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'chart_quantity'],
                [Sequelize.literal('COUNT("singular_serial"."invcd_oid")'), 'available_quantity'],
                [Sequelize.literal(`CASE WHEN "qty_location"."invc_qty_available" - cs_qty < 0 THEN 'melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                [Sequelize.literal(`CASE WHEN "qty_location"."invc_qty_available" - cs_qty < 0 THEN false ELSE true END`), 'can_be_sold'],
                [Sequelize.literal('CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                [Sequelize.literal('CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NULL THEN NULL ELSE "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" END'), 'photo'],
                ['cs_created_at', 'created_at'],
                ['cs_updated_at', 'updated_at'],
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
                                    model: PiddDet.scope('creditPaymentType'),
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
                                    as:'singular_thumbnail_product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                },
                {
                    model: InvcdDet.scope('gudangReguler', 'isVerified', 'bookedIsNull'),
                    as: 'singular_serial',
                    attributes: []
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('cs_userid'), {
                        [Op.eq]: Auth.user().userid
                    }),
                    Sequelize.where(Sequelize.col('"product->singular_relation_price_list->master_price_list"."pi_id"'), {
                        [Op.eq]: Sequelize.col('"cs_pi_id"')
                    })
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
            errorLog('GET CHART', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    updateChart = async (req, res) => {
        try {

            for (const singularDataUpdate of req.body.updateData) {
                if (singularDataUpdate.cs_qty == 0) {
                    await this.deleteDataChart(Auth.user().userid, singularDataUpdate.cs_oid)
                } else {
                    await this.updateDataChart(singularDataUpdate.cs_qty, 0, Auth.user().userid, singularDataUpdate.cs_oid)
                }    
            }

            res.status(200)
                    .json({
                        status:'success',
                        message: 'updated!',
                        data: null,
                        error: null
                    })
        } catch (error) {
            errorLog('UPDATE CHART', error.message)

                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'error',
                        data: null,
                        error: error.message
                    })
        }
    }

    deleteChart = async (req, res) => {
        const t = await sequelize.transaction();

        try {
            await this.increaseQtyInventory(req.params.cs_oid);

            this.deleteDataChart(Auth.user().userid, req.params.cs_oid)

            await t.commit();
            res.status(200)
                .json({
                    status: 'success',
                    message: 'deleted!',
                    data: null,
                    error: null
                })
        } catch (error) {
            await t.rollback();
            errorLog('DELETE CHART', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    readyToCheckout = (req, res) => {
        TConfUser.findOne({
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
                        [Sequelize.literal('COUNT("chart_sales->product->detail_quantity"."invcd_oid")'), 'available_quantity'],
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
                                    model: InvcdDet.scope('gudangReguler', 'isVerified', 'bookedIsNull', 'isNotZero'),
                                    as: 'detail_quantity',
                                    attributes: [],
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
                                            model: PiddDet.scope('cashPaymentType'),
                                            as: 'singular_detail_price_list',
                                            attributes: [],
                                        }
                                    ]
                                }
                            ],
                        }
                    ]
                }
            ],
            where: {
                userid: Auth.user().userid
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
            errorLog('GET DETAIL USER', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    updatePaymentStatus = async (req, res) => {
        try {
            await SqMstr.update({
                sq_midtrans_inv_status: req.body.payment_status
            }, {
                where: {
                    sq_midtrans_inv_number: req.params.invoice,
                    sq_ptnr_id_sold: Auth.user().user_ptnr_id
                },
                logging: async (sql, {bind}) => {
                    await insertQuery(sql, bind);
                }
            })

            if (req.body.payment_status == 'cancel' || req.body.payment_status == 'failure') {
                await releaseProduct(req.params.invoice)
            } else {
                await updateStatusTransction(req.body.payment_status, req.params.invoice)
            }

            res.status(200)
                .json({
                    status: 'success',
                    message: 'updated!',
                    data: null,
                    error: null
                })
        } catch (error) {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        }
    }

    updateDataChart = async (cartSalesOid, qtyInput, cartSalesQty) => {
        await ChartSales.update({
                cs_qty: qtyInput + cartSalesQty,
                cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    cs_oid: cartSalesOid
                },
                logging: false,
                individualHooks: true
            })
    } 

    deleteDataChart = async (userid, cartSalesOid, transaction) => {
        await bulkReleaseQuantity([cartSalesOid]);

        await ChartSales.destroy({
            where: {
                cs_oid: cartSalesOid,
                cs_userid: userid
            },
            logging: false,
            transaction,
            individualHooks: true
        })
    }

    checkQuantityProduct = async (quantityNeed, qtyPrev, stock) => {
        let valueWhenStockIsZero = "habis";
        let stockNeeded = parseInt(quantityNeed);
        let stockAvailable = stock.length;
        let totalData = quantityNeed + qtyPrev;
        let bindStock = (stockNeeded > stockAvailable || stockNeeded + totalData > stockAvailable) ? "melebihi batas" : "aman";
        
        return (stockAvailable == 0) ? valueWhenStockIsZero : bindStock;
    }

    increaseQtyProduct = async (ptCode, chartSalesOid, totalData) => {
        await urlPatchData(`/stock/${ptCode}/add-to-chart`, {
            chart_sales_oid: chartSalesOid,
            total_data: totalData
        })
    }

    decreaseQtyInventory = async (invcdOid, cartSalesOid, transaction) => {
        let batchInvcdOid = invcdOid.map(({dataValues: data}) => {
            return data.invcd_oid
        })

        await InvcdDet.update({
            invcd_is_booked: 'Y',
            invcd_cs_oid: cartSalesOid,
        }, {
            where: {
                invcd_oid: {
                    [Op.in]: batchInvcdOid
                }
            },
            // logging: false,
            // transaction
        })
    }

    increaseQtyInventory = async (cartSalesOid) => {
        await InvcdDet.update({
            invcd_is_booked: null,
            invcd_cs_oid: null
        }, {
            where: {
                invcd_cs_oid: cartSalesOid
            },
            logging: false,
        })
        // let quantityAvailable = parseInt(qtyInventory.invc_qty_available) + parseInt(qtyNeeded);
        // let quantityBooked = parseInt(qtyInventory.invc_qty_booked) - parseInt(qtyNeeded);

        // await this.updateQtyInventory(invcOid, quantityAvailable, quantityBooked, transaction);
    }

    updateQtyInventory = async (invcOid, qtyAvailable, qtyBooked, transaction) => {
        let result = await InvcMstr.update({
                invc_qty_available: qtyAvailable,
                invc_qty_booked: qtyBooked,
                invc_qty_old: qtyAvailable
            }, {
                where: {
                    invc_oid: invcOid
                },
                logging: async (sql, {bind}) => {
                    await insertQuery(sql.split(':')[1], bind)
                },
                transaction
            })
    }

    getDataCart = async (cartSalesOid, transaction) => {
        let data = await ChartSales.findOne({
            attributes: [
                'cs_oid',
                'cs_invc_oid',
                'cs_qty',
                'cs_pt_id'
            ],
            where: {
                cs_oid: cartSalesOid
            },
            logging: false
        })

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
}

module.exports = new SalesController();