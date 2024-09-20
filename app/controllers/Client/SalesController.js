const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    SqdDet,
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PiddDet, TConfUser,
    PtnraAddr, PtnracCntc, 
    RegKecMstr, RegKelMstr,
    LocMstr, SogGenPtnrMstr,
    RegPropMstr, RegCityMstr,
    PtMstr, PidDet, Sequelize, 
    SqMstr, sequelize, InvctTable,
} = require('../../../models');
const Bilangan = require('../../../helper/Bilangan');
const {insertQuery, insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');

class SalesController {
    inputIntoChart = async (req, res) => {
        try {
            let {userid, ptnrg_id} = Auth.user();

            let dataChart = await this.checkProductInChart(req.body.pt_id, req.body.invc_oid, req.body.pi_id);
            let qtyProductInChart = (dataChart != null) ? dataChart.dataValues.cs_qty : 0;
            let {status_normal, status_chart} = await this.checkQuantityProduct(req.body.pt_id, ptnrg_id, req.body.qty, parseInt(req.body.qty) + qtyProductInChart);

            if (status_normal == false || status_chart == false) {
                res.status(300)
                    .json({
                        status: 'failed',
                        message: 'jumlah permintaan barang melebihi kuantitas!',
                        data: null,
                        error: {
                            status: false
                        }
                    });

                return;
            }

            if (dataChart == null) {
                await this.createDataChart(req.body, userid);
            } else {
                await this.updateDataChart(parseInt(req.body.qty) + dataChart.dataValues.cs_qty, userid, dataChart.dataValues.cs_oid);
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
                    await this.updateDataChart(singularDataUpdate.cs_qty, Auth.user().userid, singularDataUpdate.cs_oid)
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

    checkOut = async (req, res) => {
        try {
            let {userid, usernama, user_ptnr_id} = Auth.user();
            let headerSalesQuotation = await this.generateHeaderSalesQuotation(req.body, userid, usernama, user_ptnr_id)
            
            if (headerSalesQuotation.length == 0) {
                res.status(300)
                    .json({
                        status: 'failed',
                        message: 'tidak ada barang pesanan',
                        data: null,
                        error: null
                    })

                return;
            }

            await sequelize.transaction(async t => {
                headerSalesQuotation[0]['sq_shipping_charges'] = req.body.shipping_cost;
                await this.createSalesQuotations(headerSalesQuotation, Auth.user(), t);
            })

            info('CHECKOUT SALES QUOTATION', `${usernama} HAS CHECKED OUT!`, true);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: true,
                    error: null
                })
        } catch (error) {
            errorLog('CHECKOUT PRODUCTS', error.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                });
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
                                                    [Op.in]: (Auth.user().ptnrg_id == 9911) ? [103, 202, 304] : [991, 203, 302]
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

    updateDataChart = async (qty, userid, csOid) => {
        await ChartSales.update({
            cs_qty: qty,
            cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: {
                cs_oid: csOid,
                cs_userid: userid
            },
            logging: false,
            individualHooks: true
        })
    } 

    deleteDataChart = async (userid, csOid) => {
        await ChartSales.destroy({
            where: {
                cs_oid: csOid,
                cs_userid: userid
            },
            logging: false,
            individualHooks: true
        })
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

    checkQuantityProduct = async (ptId, partnerGroupId, quantityNeed, quantityChart) => {
        const data = await PtMstr.findOne({
            attributes: [
                [Sequelize.literal('CAST("singular_product_quantity"."invc_qty_available" AS INTEGER)'), 'qty_available']
            ],
            include: [
                {
                    model: InvcMstr,
                    as: 'singular_product_quantity',
                    attributes: [],
                    include: [
                        {
                            model: LocMstr,
                            as: 'location',
                            attributes: [],
                        }
                    ]
                },
                {
                    model: PidDet,
                    as: 'singular_relation_price_list',
                    attributes: [],
                    include: [
                        {
                            model: PiMstr,
                            as:'master_price_list',
                            attributes: [],
                        },
                        {
                            model: PiddDet,
                            as:'singular_detail_price_list',
                            attributes: [],
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('pt_id'), {
                        [Op.eq]: ptId
                    }),
                    Sequelize.where(Sequelize.col('"singular_product_quantity->location"."loc_id"'), {
                        [Op.in]: [10001, 200010, 300018]
                    }),
                    Sequelize.where(Sequelize.col('"singular_relation_price_list->master_price_list"."pi_id"'), {
                        [Op.in]: (partnerGroupId == 9911) ? [103, 202, 304] : [991, 203, 302]
                    }),
                    Sequelize.where(Sequelize.col('"singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                        [Op.eq]: 9941
                    })
                ]
            },
            logging: false
        })

        return (data == null) ? {
            status_normal: false, 
            status_chart: false, 
        } : {
            status_normal: parseInt(quantityNeed) <= data.dataValues.qty_available,
            status_chart: parseInt(quantityChart) <= data.dataValues.qty_available,
        };
    }

    checkProductInChart = async (ptId, invcOid, piId) => {
        let data = await ChartSales.findOne({
            attributes: [
                'cs_oid',
                [Sequelize.literal('CAST("cs_qty" AS INTEGER)'), 'cs_qty']
            ],
            where: {
                cs_pt_id: ptId,
                cs_invc_oid: invcOid,
                cs_pi_id: piId
            },
            logging: false
        });

        return data;
    }

    createDataChart = async (body, userid) => {
        await ChartSales.create({
            cs_userid: userid,
            cs_pt_id: body.pt_id,
            cs_pt_en_id: body.en_id,
            cs_invc_oid: body.invc_oid,
            cs_qty: body.qty,
            cs_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            cs_pi_id: body.pi_id
        }, {
            individualHooks: true,
            logging: false
        })
    }

    createSalesQuotations = async (headerSalesQuotations, dataUser, transaction) => {
        for (const headerSalesQuotation of headerSalesQuotations) {
            let detailSalesQuotation = await this.generateDetailSalesQuotation(headerSalesQuotation.sq_oid, headerSalesQuotation.sq_en_id, dataUser, transaction);

            await this.createHeaderSalesQuotation(headerSalesQuotation, transaction);
            await this.createDetailSalesQuotation(detailSalesQuotation, transaction);
        }
    }

    generateHeaderSalesQuotation = async (body, userid, usernama, ptnrId, transaction) => {
        let sqEnId = await this.getEntitySq(userid, transaction)
        let baseNumber = 0;
        let headersSalesQuotation = [];

        for (const {dataValues} of sqEnId) {
            baseNumber += 1;

            headersSalesQuotation.push({
                sq_oid: uuidv4(),
                sq_dom_id: 1,
                sq_en_id: dataValues.cs_pt_en_id,
                sq_add_by: usernama,
                sq_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_code: await this.generateSalesQuotationNumber(baseNumber),
                sq_ptnr_id_sold: ptnrId,
                sq_ptnr_id_bill: ptnrId,
                sq_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_si_id: 992,
                sq_type: 'R',
                sq_sales_person: ptnrId,
                sq_pi_id: dataValues.cs_pi_id,
                sq_pay_type: body.payment_type,
                sq_pay_method: body.payment_method,
                sq_dp: 0,
                sq_disc_header: dataValues.discount,
                sq_total: dataValues.total_price,
                sq_close_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_cu_id: 1,
                sq_total_ppn: 0,
                sq_total_pph: 0,
                sq_payment: 0,
                sq_exc_rate: 1,
                sq_trans_id: 'D',
                sq_terbilang: Bilangan.parse(dataValues.total_price),
                sq_cons: 'N',
                sq_interval: 1,
                sq_ar_ac_id: 13,
                sq_ar_sb_id: 0,
                sq_ar_cc_id: 0,
                sq_need_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_is_package: 'N',
                sq_sales_program: ptnrId,
                sq_booking: 'N',
                sq_alocated: 'N',
                sq_shipping_charges: 0,
                sq_ptsfr_loc_id: dataValues.loc_id, 
                sq_ptsfr_loc_to_id: dataValues.loc_id,
                sq_ptsfr_loc_git: dataValues.loc_id,
                sq_en_to_id: 0,
                sq_pi_area_id: 1,
                sq_shipping_name: body.shipping_name,
                sq_midtrans_inv_number: body.invoice_number,
                sq_midtrans_inv_status: 'pending'
            })
        }

        return headersSalesQuotation;
    }

    generateDetailSalesQuotation = async (sqOid, enId, dataUser, transaction) => {
        let dataProducts = await this.findDetailCartProduct(sqOid, enId, dataUser);
        let createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
        let baseSequence = 1;
        let result = [];
        for (const dataProduct of dataProducts) {
            await this.updateInvcMstr(dataProduct.dataValues.cs_invc_oid, dataProduct.dataValues.cs_qty, transaction);

            result.push({
                sqd_oid: uuidv4(),
                sqd_dom_id: 1,
                sqd_en_id: enId,
                sqd_add_by: dataUser.usernama,
                sqd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sqd_sq_oid: sqOid,
                sqd_seq: baseSequence,
                sqd_si_id: 992,
                sqd_pt_id: dataProduct.dataValues.cs_pt_id,
                sqd_qty: dataProduct.dataValues.cs_qty,
                sqd_qty_allocated: 0,
                sqd_is_additional_charge: 'N',
                sqd_um: 9964,
                sqd_cost: dataProduct.dataValues.total_cost,
                sqd_price: dataProduct.dataValues.total_price,
                sqd_disc: dataProduct.dataValues.discount,
                sqd_sales_ac_id: 13,
                sqd_sales_sb_id: 0,
                sqd_sales_cc_id: 0,
                sqd_um_conv: 1,
                sqd_qty_real: dataProduct.dataValues.cs_qty,
                sqd_taxable: 'N',
                sqd_tax_inc: 'N',
                sqd_tax_class: 9949,
                sqd_dt: createdAt,
                sqd_payment: 0,
                sqd_dp: 0,
                sqd_sales_unit: 0,
                sqd_loc_id: dataProduct.dataValues.location_id,
                sqd_ppn_type: 'E',
                sqd_invc_oid: dataProduct.dataValues.cs_invc_oid,
                sqd_invc_loc_id: dataProduct.dataValues.location_id,
                sqd_need_date: createdAt,
                sqd_qty_booking: dataProduct.dataValues.cs_qty,
                sqd_qty_outs: 0,
            })

            await this.deleteDataChart(dataUser.userid, dataProduct.dataValues.cs_oid);
            baseSequence += 1;
        }

        return result;
    }

    generateSalesQuotationNumber = async (totalSq, transaction) => {
        let sqCode = 'SQM';
        let baseSequence = '0000';
        let yearPlusMonth = moment().format('YYYYMM');
        let sqSequence = await this.countDataSalesQuotation(transaction) + totalSq;
        let sequence = baseSequence.slice(0, -sqSequence.toString().length) + sqSequence;

        return sqCode + yearPlusMonth + sequence;
    }

    countDataSalesQuotation = async (transaction) => {
        let startOfMonth = moment().startOf('months').format('YYYY-MM-DD');
        let endOfMonth = moment().endOf('months').format('YYYY-MM-DD');

        let result = await SqMstr.count({
            where: {
                sq_add_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            logging: false,
            transaction
        });

        return result;
    }

    getEntitySq = async (userid, partnerGroupId, transaction) => {
        try {
            let dataEnId = await ChartSales.findAll({
                attributes: [
                    'cs_pt_en_id',
                    'cs_pi_id',
                    [Sequelize.col(`"qty_location"."invc_loc_id"`), 'loc_id'],
                    [Sequelize.literal(`ROUND(AVG("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"), 2)`), 'discount'],
                    [Sequelize.literal('CAST(SUM(cs_qty) AS INTEGER)'), 'cs_qty'],
                    [Sequelize.literal('CAST(SUM(cs_qty * "product"."pt_weight") AS INTEGER)'), 'total_weight_package'],
                    [Sequelize.literal(`CAST(SUM((cs_qty * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price") - (cs_qty * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2))) AS INTEGER)`), 'total_price']
                ],
                group: [
                    'cs_pt_en_id', 
                    'cs_pi_id',
                    Sequelize.col(`"qty_location"."invc_loc_id"`)
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
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: [],
                                        where: {
                                            pidd_payment_type: 9941
                                        }
                                    }, {
                                        model: PiMstr,
                                        as: 'master_price_list',
                                        attributes: [],
                                        where: {
                                            pi_id: {
                                                [Op.in]: (partnerGroupId == 9911) ? [103, 202, 304] : [991, 203, 302]
                                            }
                                        }
                                    }
                                ],
                            }
                        ]
                    }, {
                        model: InvcMstr,
                        as: 'qty_location',
                        attributes: []
                    }
                ],
                where: {
                    cs_userid: userid
                },
                order: [
                    ['cs_pt_en_id', 'ASC']
                ],
                logging: false,
                transaction,
            })
    
            return dataEnId;
        } catch (error) {
            return error.message
        }
    }

    findDetailCartProduct = async (sqOid, enId, dataUser) => {
        try {
            let dataProducts = await ChartSales.findAll({
                attributes: [
                    [Sequelize.literal(`'${sqOid}'`), 'sqd_sq_oid'],
                    'cs_oid',
                    'cs_pt_id',
                    [Sequelize.literal(`"cs_qty" * "product->singular_table_cost"."invct_cost"`), 'total_cost'],
                    [Sequelize.literal(`("cs_qty" * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price") - ("cs_qty" * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * "product->singular_relation_price_list->singular_detail_price_list"."pidd_disc")`), 'total_price'],
                    [Sequelize.literal(`"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`), 'discount'],
                    'cs_qty',
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
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: [],
                                        where: {
                                            pidd_payment_type: 9941
                                        }
                                    }, {
                                        model: PiMstr,
                                        as: 'master_price_list',
                                        attributes: [],
                                        where: {
                                            pi_id: {
                                                [Op.in]: (dataUser.ptnrg_id == 9911) ? [103, 202, 304] : [991, 203, 302]
                                            }
                                        }
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
                    cs_userid: dataUser.userid,
                    cs_pt_en_id: enId
                },
                logging: false
            })

            return dataProducts;
        } catch (error) {
            return error.message
        }
    }

    updateInvcMstr = async (invcOid, qty, transaction) => {
        let {invc_qty_booked, invc_qty_available} = await this.findDataInvcMstr(invcOid, transaction);
        let qtyBooked = parseInt(invc_qty_booked) + parseInt(qty);
        let qtyAvailable = parseInt(invc_qty_available) - parseInt(qty);

        console.info()

        await this.updateDataInvcMstr(invcOid, qtyBooked, qtyAvailable, parseInt(invc_qty_available), transaction)
    }

    findDataInvcMstr = async (invcOid, transaction) => {
        let {dataValues} = await InvcMstr.findOne({
            attributes: [
                'invc_qty_available',
                'invc_qty_booked'
            ],
            where: {
                invc_oid: invcOid
            }, 
            logging: false,
            transaction
        });

        return dataValues;
    }

    updateDataInvcMstr = async (invcOid, qtyBooked, qtyAvailable, qtyOld, transaction) => {
        try {
            await InvcMstr.update({
                invc_qty_available: qtyAvailable,
                invc_qty_booked: qtyBooked,
                invc_qty_old: qtyOld
            }, {
                where: {
                    invc_oid: invcOid
                },
                logging: async (sql, {bind}) => {
                    insertQuery(sql.split(':')[1], bind)
                },
                transaction
            })
        } catch (error) {
            return error.message
        }
    }

    createHeaderSalesQuotation = async (dataHeaderSalesQuotation, transaction) => {
        await SqMstr.bulkCreate([dataHeaderSalesQuotation], {
            transaction,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql)
            }
            // logging: false,
        })
    }

    createDetailSalesQuotation = async (dataDetailSalesQuotation, transaction) => {
        await SqdDet.bulkCreate(dataDetailSalesQuotation, {
            transaction,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql)
            },
            // logging: false
        })
    }
}

module.exports = new SalesController();