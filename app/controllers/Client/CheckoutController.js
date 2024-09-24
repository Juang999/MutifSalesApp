const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PiddDet, TConfUser,
    SqdDet, TConfSetting,
    PtnraAddr, PtnracCntc, 
    RegKecMstr, RegKelMstr,
    LocMstr, SogGenPtnrMstr,
    RegPropMstr, RegCityMstr,
    PtMstr, PidDet, Sequelize, 
    SqMstr, sequelize, InvctTable,
} = require('../../../models');
const Bilangan = require('../../../helper/Bilangan');
const {insertQuery, insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {getData: urlGetData, patchData: urlPatchData, putData: urlPutData, putData} = require('../../../helper/ProductStock');

class CheckoutController {
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

    createSalesQuotations = async (headerSalesQuotations, dataUser, transaction) => {
        for (const headerSalesQuotation of headerSalesQuotations) {
            let detailSalesQuotation = await this.generateDetailSalesQuotation(headerSalesQuotation.sq_oid, headerSalesQuotation.sq_en_id, headerSalesQuotation.sq_midtrans_inv_number, headerSalesQuotation.sq_midtrans_inv_status, dataUser, transaction);

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
            let [shippingName, shippingService] = body.shipping_name.split('-'); 

            headersSalesQuotation.push({
                sq_oid: uuidv4(),
                sq_dom_id: 1,
                sq_en_id: dataValues.cs_pt_en_id,
                sq_add_by: usernama,
                sq_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_code: await this.generateSalesQuotationNumber(baseNumber, dataValues.cs_pt_en_id),
                sq_ptnr_id_sold: ptnrId,
                sq_ptnr_id_bill: ptnrId,
                sq_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_credit_terms: 999,
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
                sq_sales_program: '-',
                sq_booking: 'Y',
                sq_book_start_date: moment().format('YYYY-MM-DD'),
                sq_book_end_date: moment().add(1, 'days').format('YYYY-MM-DD'),
                sq_alocated: 'N',
                sq_shipping_charges: 0,
                sq_ptsfr_loc_id: dataValues.loc_id, 
                sq_ptsfr_loc_to_id: dataValues.loc_id,
                sq_ptsfr_loc_git: dataValues.loc_id,
                sq_en_to_id: 0,
                sq_dropshipper: 'N',
                sq_pi_area_id: 1,
                sq_dg_group: 'N',
                sq_shipping_name: shippingName,
                sq_midtrans_inv_number: body.invoice_number,
                sq_midtrans_inv_status: 'pending',
                sq_shipping_service: shippingService
            })
        }

        return headersSalesQuotation;
    }

    generateDetailSalesQuotation = async (sqOid, enId, invoiceNumber, invoiceStatus, dataUser, transaction) => {
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

            await this.updateSalesQuotationNumber(invoiceStatus, invoiceNumber, dataProduct.dataValues.cs_oid)
            await this.deleteDataChart(dataUser.userid, dataProduct.dataValues.cs_oid);
            baseSequence += 1;
        }

        return result;
    }

    generateSalesQuotationNumber = async (totalSq, entityId, transaction) => {
        let {dataValues} = await TConfSetting.findOne({
            attributes: [
                'server_code'
            ]
        });

        let sqCode = 'SQ';
        let baseSequence = '0000';
        let entityCode = `${entityId}0`;
        let montlyId = '000';
        let serverCode = dataValues.server_code;
        let yearPlusMonth = moment().format('YYMM');
        let sqSequence = await this.countDataSalesQuotation(transaction) + totalSq;
        let sequence = baseSequence.slice(0, -sqSequence.toString().length) + sqSequence;

        return sqCode + entityCode + yearPlusMonth + serverCode + montlyId + sequence;
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

    updateSalesQuotationNumber = async (statusSalesQuotation, salesQuotationNumber, chartSalesOid) => {
        await urlPutData(`/stock/${chartSalesOid}/update`, {
            status_transaction: statusSalesQuotation,
            sq_code: salesQuotationNumber
        })
    }
}

module.exports = new CheckoutController();