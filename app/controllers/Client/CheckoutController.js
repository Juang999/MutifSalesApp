const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    SqdDet, InvcdDet,
    InvcMstr, PiddDet,
    ChartSales, PiMstr,
    PtMstr, PidDet, Sequelize, 
    SqMstr, sequelize, InvctTable,
} = require('../../../models');
const Bilangan = require('../../../helper/Bilangan');
const ServerSetting = require('../../../helper/SettingServer');
const {insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');

class CheckoutController {
    checkOut = async (req, res) => {
        const dataUser = Auth.user();

        const t = await sequelize.transaction();

        try {
            let RAW_DATA_HEADER_SQ = this.getDataHeaderSalesQuotation(dataUser.userid);
            let RAW_DATA_BODY_SQ = this.getDataDetailSalesQuotation(dataUser);

            let [dataHeaderSq, dataBodySq] = await Promise.all([RAW_DATA_HEADER_SQ, RAW_DATA_BODY_SQ])

            if (dataHeaderSq.length == 0) {
                res.status(300)
                    .json({
                        status: 'failed',
                        message: 'tidak ada barang pesanan',
                        data: null,
                        error: null
                    })

                return;
            }

            let headerSalesQuotation = await this.generateHeaderSalesQuotation(dataHeaderSq, req.body, dataUser);
            let detailSalesQuotation = this.generateDetailSalesQuotation(dataBodySq, headerSalesQuotation, dataUser);
            headerSalesQuotation[0]['sq_shipping_charges'] = req.body.shipping_cost;

            await this.createHeaderSalesQuotation(headerSalesQuotation, t);
            this.sleep(1000)
            await this.createDetailSalesQuotation(detailSalesQuotation, t);
            await this.updateTransactionCode(dataBodySq, req.body.invoice_number, t);
            await this.deleteDataChart(dataUser.userid, dataBodySq, t);

            await t.commit();
            info('CHECKOUT SALES QUOTATION', `${Auth.user().usernama} HAS CHECKED OUT!`, true);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: true,
                    error: null
                })
        } catch (error) {
            await t.rollback();
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

    /**
     * functions for generating HEADER SALES QUOTATION
     * start AREA HEADER SALES QUOTATION FUNCTIONS
    */
    generateHeaderSalesQuotation = async (dataHeader, formBody, user) => {
        let SEQUENCE_NUMBER = 0;
        let TOTAL_SQ_THIS_MONTH = await this.countDataSalesQuotation();
        let {dataValues: dataServer} = await ServerSetting.get(['serv_code']);

        let {serv_code: SERVER_CODE} = dataServer;

        let dataHeadersSalesQuotation = dataHeader.map(({dataValues}) => {
            let {
                discount,
                loc_id: locationId,
                cs_pi_id: priceListId,
                total_price: totalPrice,
                cs_pt_en_id: productEntityId,
            } = dataValues;
            SEQUENCE_NUMBER += 1;

            let REQUIREMENT_DATA_FOR_SQ_NUMBER = {
                entity_id: productEntityId,
                sq_sequence: TOTAL_SQ_THIS_MONTH
            }

            let [shippingName, shippingService] = formBody.shipping_name.split('-'); 
            let sqCode = this.generateSalesQuotationNumber(REQUIREMENT_DATA_FOR_SQ_NUMBER, SEQUENCE_NUMBER, SERVER_CODE);

            return {
                sq_oid: uuidv4(),
                sq_dom_id: 1,
                sq_en_id: productEntityId,
                sq_add_by: user.usernama,
                sq_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_code: sqCode,
                sq_ptnr_id_sold: user.user_ptnr_id,
                sq_ptnr_id_bill: user.user_ptnr_id,
                sq_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_credit_term: 999,
                sq_si_id: 992,
                sq_type: 'R',
                sq_sales_person: user.user_ptnr_id,
                sq_pi_id: priceListId,
                sq_pay_type: formBody.payment_type,
                sq_pay_method: formBody.payment_method,
                sq_dp: 0,
                sq_disc_header: discount,
                sq_total: totalPrice,
                sq_close_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_cu_id: 1,
                sq_total_ppn: 0,
                sq_total_pph: 0,
                sq_payment: 0,
                sq_exc_rate: 1,
                sq_trans_id: 'D',
                sq_terbilang: Bilangan.parse(totalPrice),
                sq_cons: 'N',
                sq_interval: 1,
                sq_ar_ac_id: 13,
                sq_ar_sb_id: 0,
                sq_ar_cc_id: 0,
                sq_need_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_is_package: 'N',
                sq_sales_program: '-',
                sq_booking: 'Y',
                sq_book_start_date: moment().format('YYYY-MM-DD'),
                sq_book_end_date: moment().add(1, 'days').format('YYYY-MM-DD'),
                sq_alocated: 'N',
                sq_shipping_charges: 0,
                sq_ptsfr_loc_id: locationId, 
                sq_ptsfr_loc_to_id: locationId,
                sq_ptsfr_loc_git: locationId,
                sq_en_to_id: 0,
                sq_dropshipper: 'N',
                sq_pi_area_id: 1,
                sq_dg_group: 'N',
                sq_shipping_name: shippingName,
                sq_midtrans_inv_number: formBody.invoice_number,
                sq_midtrans_inv_status: 'pending',
                sq_shipping_service: shippingService
            }
        });

        return dataHeadersSalesQuotation;
    }

    getDataHeaderSalesQuotation = async (userid) => {
        let dataSalesQuotation = await ChartSales.findAll({
            attributes: [
                'cs_pt_en_id',
                'cs_pi_id',
                [Sequelize.col(`"qty_location"."invc_loc_id"`), 'loc_id'],
                [Sequelize.literal(`ROUND(AVG("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"), 2)`), 'discount'],
                [Sequelize.literal('CAST(SUM(cs_qty) AS INTEGER)'), 'cs_qty'],
                [Sequelize.literal('CASE WHEN "product"."pt_weight" IS NULL THEN CAST(SUM(cs_qty * 600) AS INTEGER) ELSE CAST(SUM(cs_qty * "product"."pt_weight") AS INTEGER) END'), 'total_weight_package'],
                [Sequelize.literal(`CAST(SUM((cs_qty * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price") - (cs_qty * "product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2))) AS INTEGER)`), 'total_price']
            ],
            group: [
                'cs_pt_en_id', 
                'cs_pi_id',
                Sequelize.col(`"product"."pt_weight"`),
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
                                    model: PiddDet.scope('creditPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: [],
                                }, {
                                    model: PiMstr.scope('priceListDistributor'),
                                    as: 'master_price_list',
                                    attributes: [],
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
        })

        return dataSalesQuotation;
    }

    generateSalesQuotationNumber = (dataSq, totalSq, serverCode) => {
        let sqCode = 'SQ';
        let montlyId = '000';
        let baseSequence = '0000';
        let entityCode = `${dataSq.entity_id}0`;
        let yearPlusMonth = moment().format('YYMM');
        let sqSequence = totalSq + dataSq.sq_sequence;
        let sequence = baseSequence.slice(0, -sqSequence.toString().length) + sqSequence;

        return sqCode + entityCode + yearPlusMonth + serverCode + montlyId + sequence;
    }

    countDataSalesQuotation = async () => {
        let startOfMonth = moment().startOf('months').format('YYYY-MM-DD');
        let endOfMonth = moment().endOf('months').format('YYYY-MM-DD');

        let result = await SqMstr.count({
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.literal('DATE(sq_add_date)'), {
                        [Op.between]: [startOfMonth, endOfMonth]
                    })
                ],
            },
            logging: false,
        });

        return result;
    }

    /**
     * functions for generating HEADER SALES QUOTATION
     * end AREA HEADER SALES QUOTATION FUNCTIONS
    */

    /**
     * functions for generating BODY SALES QUOTATION
     * start AREA BODY SALES QUOTATION FUNCTIONS
    */

    generateDetailSalesQuotation = (dataBody, headerSalesQuotation, dataUser) => {
        let createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
        let baseSequence = 1;

        let result = dataBody.map(body => {
            let [dataHeaderSalesQuotation] = headerSalesQuotation.filter(item => item.sq_en_id == body.dataValues.en_id)

            let data = {
                sqd_oid: uuidv4(),
                sqd_dom_id: 1,
                sqd_en_id: body.dataValues.en_id,
                sqd_add_by: dataUser.usernama,
                sqd_add_date: createdAt,
                sqd_sq_oid: dataHeaderSalesQuotation.sq_oid,
                sqd_seq: baseSequence,
                sqd_si_id: 992,
                sqd_pt_id: body.dataValues.cs_pt_id,
                sqd_qty: body.dataValues.cs_qty,
                sqd_qty_allocated: 0,
                sqd_is_additional_charge: 'N',
                sqd_um: 9964,
                sqd_cost: body.dataValues.total_cost,
                sqd_price: body.dataValues.total_price,
                sqd_disc: body.dataValues.discount,
                sqd_sales_ac_id: 13,
                sqd_sales_sb_id: 0,
                sqd_sales_cc_id: 0,
                sqd_um_conv: 1,
                sqd_qty_real: body.dataValues.cs_qty,
                sqd_taxable: 'N',
                sqd_tax_inc: 'N',
                sqd_tax_class: 9949,
                sqd_dt: createdAt,
                sqd_payment: 0,
                sqd_dp: 0,
                sqd_sales_unit: 0,
                sqd_loc_id: body.dataValues.location_id,
                sqd_ppn_type: 'E',
                sqd_invc_oid: body.dataValues.cs_invc_oid,
                sqd_invc_loc_id: body.dataValues.location_id,
                sqd_need_date: createdAt,
                sqd_qty_booking: body.dataValues.cs_qty,
                sqd_qty_outs: 0,
            };

            baseSequence += 1;
            return data;
        })

        return result;
    }

    getDataDetailSalesQuotation = async (dataUser) => {
        try {
            let dataProducts = await ChartSales.findAll({
                attributes: [
                    'cs_oid',
                    'cs_pt_id',
                    ['cs_pt_en_id', 'en_id'],
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
                    cs_userid: dataUser.userid,
                },
                logging: false
            })

            return dataProducts;
        } catch (error) {
            return error.message
        }
    }

    /**
     * functions for generating BODY SALES QUOTATION
     * end AREA BODY SALES QUOTATION FUNCTIONS
    */

    createHeaderSalesQuotation = async (dataHeaderSalesQuotation, transaction) => {
        await SqMstr.bulkCreate(dataHeaderSalesQuotation, {
            transaction,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql, 1)
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

                await insertBulkQuery(realSql, 2)
            },
            // logging: false
        })
    }

    updateTransactionCode = async (dataCartSales, SalesQuotationMobile, transaction) => {
        let CART_SALES_OID = dataCartSales.map(({dataValues}) => dataValues.cs_oid);

        await InvcdDet.update({
            invcd_transaction_code: SalesQuotationMobile,
            invcd_cs_oid: null
        }, {
            where: {
                invcd_cs_oid: {
                    [Op.in]: CART_SALES_OID
                }
            },
            transaction
        })
    }

    deleteDataChart = async (userid, dataCartSales, trans) => {
        let CART_SALES_OID = dataCartSales.map(({dataValues}) => dataValues.cs_oid);

        await ChartSales.destroy({
            where: {
                cs_oid: {
                    [Op.in]: CART_SALES_OID
                },
                cs_userid: userid
            },
            logging: false,
            transaction: trans,
            individualHooks: true
        })
    }

    sleep = (milliseconds) => {
        const now = new Date().getTime();
        while (new Date().getTime() < now + milliseconds) {
        }
    }
}

module.exports = new CheckoutController();