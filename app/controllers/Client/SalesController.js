const {Op} = require('sequelize');
const moment = require('moment');
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PiddDet, TConfUser,
    PtnraAddr, PtnracCntc, 
    LocMstr, SogGenPtnrMstr,
    PtMstr, PidDet, Sequelize, 
    RegKecMstr, RegKelMstr,
    RegPropMstr, RegCityMstr,
    SqMstr,
} = require('../../../models');

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
            let dataPartner = await this.getPartner(Auth.user().user_ptnr_id);

            console.info(dataPartner);
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

    createSqForm = (body) => {
        let createdAt = moment().format('YYY-MM-DD HH:mm:ss');

        // sq_oid
        // sq_dom_id: 1,
        // sq_en_id
        // sq_add_by: Auth.user().usernama,
        // sq_add_date: createdAt,
        // sq_code
        // sq_ptnr_id_sold: Auth.user().user_ptnr_id,
        // sq_ptnr_id_bill: Auth.user().user_ptnr_id,
        // sq_date
        // sq_si_id: 992,
        // sq_type: 'R',
        // sq_sales_person
        // sq_pi_id
        // sq_pay_type: body.payment_type,
        // sq_pay_method: body.payment_method,
        // sq_dp: 0,
        // sq_disc_header: body.discount,
        // sq_total
        // sq_close_date
        // sq_trans_id: 'D',
        // sq_trans_rmks: body.remarks,
        // sq_dt
        // sq_cu_id: 1,
        // sq_total_ppn: 0,
        // sq_total_pph: 0,
        // sq_payment: 0,
        // sq_exc_rate
        // sq_cons: 'N',
        // sq_terbilang: body.terbilang,
        // sq_interval
        // sq_ar_ac_id: 13,
        // sq_ar_sb_id
        // sq_ar_cc_id
        // sq_need_date
        // sq_is_package
        // sq_sales_program
        // sq_booking
        // sq_book_start_date
        // sq_book_end_date
        // sq_alocated
        // sq_shipping_charges
        // sq_ptsfr_loc_id
        // sq_ptsfr_loc_to_id
        // sq_ptsfr_loc_git
        // sq_en_to_id
        // sq_dropshipper
        // sq_pi_area_id
    }

    createSalesQuotationNumber = async () => {

    }

    countDataSalesQuotation = async () => {
        let startOfMonth = moment().startOf('months').format('YYYY-MM-DD');
        let endOfMonth = moment().endOf('months').format('YYYY-MM-DD');

        let result = await SqMstr.count({
            where: {
                sq_add_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        return result;
    }
}

module.exports = new SalesController();