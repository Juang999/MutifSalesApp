const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const {error: errorLog} = require('../../../helper/Logging');
const {
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PiddDet, TConfUser,
    PtnraAddr, PtnracCntc, 
    RegKecMstr, RegKelMstr,
    SqMstr, SogGenPtnrMstr,
    RegPropMstr, RegCityMstr,
    PtMstr, PidDet, Sequelize, 
} = require('../../../models');
const {insertQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {getData: urlGetData, patchData: urlPatchData, putData: urlPutData} = require('../../../helper/ProductStock');
const {getStockWithTransaction, updateStock, deleteOidFromStockProduct} = require('../../modules/Stock/controllers/StockProductController');

class SalesController {
    inputIntoChart = async (req, res) => {
        try {
            let csOid = uuidv4();
            let {qty, pt_id} = req.body;
            let ptCode = await this.getProductCode(pt_id);
            let {quantity: qtyStock} = await getStockWithTransaction(ptCode);
            let dataChart = await this.checkProductInChart(pt_id, Auth.user().userid);

            let [
                checkingStatus, 
                statusUpdatingQuantity
            ] = await Promise.all([
                    this.checkQuantityProduct(qty, qtyStock), 
                    updateStock(ptCode, csOid, qty)
            ]);

            if (checkingStatus == true || statusUpdatingQuantity[0] != qty) {
                await deleteOidFromStockProduct(csOid, statusUpdatingQuantity[0]);
                let message = (statusUpdatingQuantity[0] == 0) ? 'stok barang sudah habis!' : `barang tersisa ${qtyStock}`;

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

            if (dataChart == null) {
                await this.createDataChart(csOid, req.body, qty, Auth.user().userid);
            } else {
                let {cs_qty, cs_oid} = dataChart.dataValues;

                await this.updateDataChart(parseInt(req.body.qty), cs_qty, Auth.user().userid, cs_oid);
            }

            res.status(200)
                .json({
                    status: 'success', 
                    message: 'ok',
                    data: true,
                    error: null
                })
        } catch (error) {
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

    getDataChart = async (req, res) => {
        try {
            let {userid} = Auth.user();

            let dataChart = await ChartSales.findAll({
                attributes: [
                    'cs_oid',
                    [Sequelize.col('product.pt_desc1'), 'product_name'],
                    [Sequelize.col('product.pt_code'), 'product_code'],
                    [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'chart_quantity'],
                    [Sequelize.literal('CAST("qty_location"."invc_qty_available" AS INTEGER)'), 'available_quantity'],
                    [Sequelize.literal(`CASE WHEN "qty_location"."invc_qty_available" - cs_qty < 0 THEN 'melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                    [Sequelize.literal(`CASE WHEN "qty_location"."invc_qty_available" - cs_qty < 0 THEN false ELSE true END`), 'can_be_sold'],
                    [Sequelize.literal('CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                    [Sequelize.literal('ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
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
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: InvcMstr,
                        as: 'qty_location',
                        attributes: []
                    }
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('cs_userid'), {
                            [Op.eq]: userid
                        }),
                        Sequelize.where(Sequelize.col('"product->singular_relation_price_list->master_price_list"."pi_id"'), {
                            [Op.eq]: Sequelize.col('"cs_pi_id"')
                        }),
                        Sequelize.where(Sequelize.col('"product->singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                            [Op.eq]: 9941
                        })
                    ]
                },
                order: [
                    ['cs_updated_at', 'desc']
                ],
                logging: false
            })

            if (dataChart == null) {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'ok',
                        data: [],
                        error: null
                    })
            }

            let result = await this.getImages(dataChart);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            errorLog('GET CHART', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
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

    deleteChart = (req, res) => {
        this.deleteDataChart(Auth.user().userid, req.params.cs_oid)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'deleted!',
                    data: null,
                    error: null
                })
        })
        .catch(err => {
            errorLog('DELETE CHART', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
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
                        [Sequelize.literal('CAST("chart_sales->product->singular_product_quantity"."invc_qty_available" AS INTEGER)'), 'available_quantity'],
                        [Sequelize.literal(`CAST("chart_sales->product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                        [Sequelize.literal(`ROUND("chart_sales->product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                        [Sequelize.literal(`CAST("chart_sales->product"."pt_weight" AS INTEGER)`), 'pt_weight']
                    ],
                    include: [
                        {
                            model: PtMstr,
                            as: 'product',
                            attributes: [],
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
                                                pidd_payment_type: 9941
                                            }
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
                await this.releaseProducts(req.params.invoice)
            } else {
                await this.updateStatusTransaction(req.params.invoice, req.body.payment_status)
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

    updateDataChart = async (qtyInput, cartSalesQty, userid, cartSalesOid) => {
        await ChartSales.update({
                cs_qty: qtyInput + cartSalesQty,
                cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    cs_oid: cartSalesOid,
                    cs_userid: userid
                },
                logging: false,
                individualHooks: true
            })
    } 

    deleteDataChart = async (userid, cartSalesOid) => {
        let {cs_pt_id, cs_qty: quantityFromCart} = await this.singularDataChart(cartSalesOid);
        let productCode = await this.getProductCode(cs_pt_id);

        await ChartSales.destroy({
            where: {
                cs_oid: cartSalesOid,
                cs_userid: userid
            },
            logging: false,
            individualHooks: true
        })

        await this.decreaseQtyProduct(productCode, cartSalesOid, quantityFromCart)
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

    getPartner = async (userPtnrId) => {
        let result = await SogGenPtnrMstr.findOne({
            attributes: [
                'sog_gen_ptnr_mstr_id',
                'sog_gen_ptnr_mstr_en_id',
                'sog_gen_ptnr_mstr_code',
                'sog_gen_ptnr_mstr_name',
                'sog_gen_ptnr_mstr_addr',
                'sog_gen_ptnr_mstr_jbl_id',
                'sog_gen_ptnr_mstr_is_cus'
            ],
            where: {
                sog_gen_ptnr_mstr_id: userPtnrId,
            }
        })

        return result;
    }

    checkQuantityProduct = async (quantityNeed, stock) => {
        return (stock == 0) ? true : parseInt(quantityNeed) > stock;
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

    createDataChart = async (csOid, body, qty, userid) => {
        console.info(csOid, body.pt_id, qty, userid)
        await ChartSales.create({
                cs_oid: csOid,
                cs_userid: userid,
                cs_pt_id: body.pt_id,
                cs_pt_en_id: body.en_id,
                cs_invc_oid: body.invc_oid,
                cs_qty: qty,
                cs_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                cs_pi_id: body.pi_id
            }, {
                individualHooks: true,
                // logging: false
            })
    }

    getProductCode = async (ptId) => {
        let {dataValues} = await PtMstr.findOne({
            attributes: [
                'pt_code'
            ],
            where: {
                pt_id: ptId
            },
            logging: false
        })

        return dataValues.pt_code
    }

    increaseQtyProduct = async (ptCode, chartSalesOid, totalData) => {
        await urlPatchData(`/stock/${ptCode}/add-to-chart`, {
            chart_sales_oid: chartSalesOid,
            total_data: totalData
        })
    }

    decreaseQtyProduct = async (ptCode, chartSalesOid, totalData) => {
        await urlPatchData(`/stock/${ptCode}/remove-from-chart`, {
            chart_sales_oid: chartSalesOid,
            total_data: totalData
        })
    }

    singularDataChart = async (csOid) => {
        let {dataValues} = await ChartSales.findOne({
            attributes: [
                'cs_pt_id',
                'cs_qty'
            ],
            where: {
                cs_oid: csOid
            },
            logging: false
        });

        return dataValues;
    }

    updateStatusTransaction = async (salesQuotationNumber, statusTransaction) => {
        await urlPatchData(`/stock/${salesQuotationNumber}/update-status-transaction`, {
            status_transaction: statusTransaction
        })
    }

    releaseProducts = async (salesQuotationNumber) => {
        await urlPutData(`/stock/${salesQuotationNumber}/release-products`)
    }
}

module.exports = new SalesController();