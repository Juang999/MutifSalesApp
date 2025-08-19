const moment = require('moment');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const Bilangan = require('../../../helper/Bilangan');
const {sequelize, TConfSetting} = require('../../../models');
const ServerSetting = require('../../../helper/SettingServer');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {errorResponse, serverSetting} = require('../../../helper/Helper');
const {CartService, SalesQuotationService, PartnerService, SalesOrderService} = require('../../services/ServiceContainer');

class CheckoutController {
    checkOut = async (req, res) => {
        const dataUser = Auth.user();
        const t = await sequelize.transaction();

        try {
            let [dataLocation, dataHeaderSq, dataBodySq] = await Promise.all([
                PartnerService.getLocationPartner(dataUser.user_ptnr_id),
                CartService.getDataHeaderSalesQuotation(dataUser.userid, 'N', 'N'), 
                CartService.getDataDetailSalesQuotation(dataUser.userid, 'N', 'N'),
            ])

            let dataPartner = null;
            if (req.body.referral_code && req.body.referral_code != '-') {
                let resultDataPartner = await PartnerService.getPartnerReference(req.body.referral_code);

                if (resultDataPartner == null) {
                    res.status(404)
                        .json({
                            status: 'failed',
                            message: 'partner not found',
                            data: null,
                            error: null
                        });

                    return;
                } else {
                    dataPartner = resultDataPartner;
                }
            }

            if (dataHeaderSq.length == 0) {
                res.status(300)
                    .json({
                        status: 'failed',
                        message: 'tidak ada barang pesanan',
                        data: null,
                        error: null
                    });

                return;
            }

            let headerSalesQuotation = await this.generateHeaderSalesQuotation(dataHeaderSq, req.body, dataLocation, dataUser, dataPartner);
            let detailSalesQuotation = this.generateDetailSalesQuotation(dataBodySq, headerSalesQuotation, dataUser);
            headerSalesQuotation[0]['sq_shipping_charges'] = req.body.shipping_cost;

            if (req.body.transaction_type == 'Y' && dataUser.ptnrg_id == 9911) {
                headerSalesQuotation[0]['sq_total'] = parseInt(headerSalesQuotation[0]['sq_total']) + 7500;
                detailSalesQuotation.push(this.packingCharges(headerSalesQuotation[0], dataUser));
            }

            await SalesQuotationService.bulkInsertHeaderSalesQuotation(headerSalesQuotation, t);
            this.sleep(1000)
            await SalesQuotationService.bulkInsertDetailSalesQuotation(detailSalesQuotation, t);
            await CartService.bulkDeleteDataCart(dataBodySq, dataUser, t);

            await t.commit();

            if (await this.configurationSoDirectly() == 'Y') {
                await this.salesOrder(req.body.invoice_number)
            }

            info('CHECKOUT PRODUCTS', `${Auth.user().usernama} HAS CHECKED OUT!`, true);

            res.status(200)
                .json({
                    status:'success',
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
                    error: errorResponse(error.message)
                });
        }
    }

    generateHeaderSalesQuotation = async (dataHeader, formBody, dataLocation, user, partnerReference) => {
        let sequenceNumber = 0;
        let totalSQofTheMonth = await SalesQuotationService.countDataSalesQuotation();
        let {dataValues: dataServer} = await ServerSetting.get(['server_code']);
        let configSoDirectly = await this.configurationSoDirectly()

        let dataHeadersSalesQuotation = dataHeader.map(({dataValues}) => {
            sequenceNumber += 1;

            let [shippingName, shippingService] = formBody.shipping_name.split('-'); 

            let salesQuotationCode = this.generateSalesQuotationNumber({
                entity_id: dataValues.cs_pt_en_id,
                sq_sequence: totalSQofTheMonth
            }, sequenceNumber, dataServer.server_code);

            let [location] = dataLocation.filter(({dataValues: singularLocation}) => {
                return singularLocation.dbgd_en_id == dataValues.cs_pt_en_id
            })

            return {
                sq_oid: uuidv4(),
                sq_dom_id: 1,
                sq_en_id: dataValues.cs_pt_en_id,
                sq_add_by: user.usernama,
                sq_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_code: salesQuotationCode,
                sq_ptnr_id_sold: user.user_ptnr_id,
                sq_ptnr_id_bill: user.user_ptnr_id,
                sq_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_credit_term: 303,
                sq_taxable: 'N',
                sq_tax_class: 9949,
                sq_si_id: 992,
                sq_type: 'R',
                sq_sales_person: formBody.sales_person_id,
                sq_pi_id: dataValues.cs_pi_id,
                sq_pay_type: formBody.payment_type,
                sq_pay_method: formBody.payment_method,
                sq_dp: 0,
                sq_disc_header: 0,
                sq_total: dataValues.total_price,
                sq_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
                sq_cu_id: 1,
                sq_total_ppn: 0,
                sq_total_pph: 0,
                sq_payment: 0,
                sq_exc_rate: 1,
                sq_tran_id: 19,
                sq_trans_id: (configSoDirectly == 'Y') ? 'C' : 'D',
                sq_terbilang: Bilangan.parse(dataValues.total_price),
                sq_tax_inc: 'N',
                sq_cons: (formBody.is_consigment == 'Y') ? 'Y' : 'N',
                sq_interval: 1,
                sq_ar_ac_id: 13,
                sq_ar_sb_id: 0,
                sq_ar_cc_id: 0,
                sq_need_date: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                sq_is_package: 'N',
                sq_sales_program: '-',
                sq_booking: 'Y',
                sq_book_start_date: moment().format('YYYY-MM-DD'),
                sq_book_end_date: moment().add(1, 'days').format('YYYY-MM-DD'),
                sq_alocated: 'N',
                sq_shipping_charges: 0,
                sq_ptsfr_loc_id: dataValues.loc_id, 
                sq_ptsfr_loc_to_id: dataValues.loc_id,
                sq_ptsfr_loc_git: dataValues.loc_git,
                sq_en_to_id: 0,
                sq_dropshipper: formBody.transaction_type,
                sq_trans_rmks: (formBody.remarks) ? formBody.remarks : null,
                sq_pi_area_id: 1,
                sq_dg_group: 'N',
                sq_shipping_name: shippingName,
                sq_midtrans_inv_number: formBody.invoice_number,
                sq_midtrans_inv_status: 'pending',
                sq_shipping_service: shippingService,
                sq_partner_reference_id: (partnerReference != null) ? partnerReference.dataValues.ptnr_id : null,
                sq_first_name: formBody.first_name,
                sq_last_name: formBody.last_name,
                sq_full_address: formBody.address,
                sq_city: formBody.city,
                sq_email: formBody.email || null,
                sq_phone_number: formBody.phone || null,
                sq_link_resi: formBody.resi_link || null,
            }
        });

        return dataHeadersSalesQuotation;
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

    generateDetailSalesQuotation = (dataBody, headerSalesQuotation, dataUser) => {
        let baseSequence = 1;

        let result = dataBody.map(({dataValues: dataDetail}) => {
            let [dataHeaderSalesQuotation] = headerSalesQuotation.filter(item => {
                return item.sq_en_id == dataDetail.en_id && item.sq_ptsfr_loc_id == dataDetail.location_id
            })

            let data = {
                sqd_oid: uuidv4(),
                sqd_dom_id: 1,
                sqd_en_id: dataDetail.en_id,
                sqd_add_by: dataUser.usernama,
                sqd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sqd_sq_oid: dataHeaderSalesQuotation.sq_oid,
                sqd_seq: baseSequence,
                sqd_si_id: 992,
                sqd_pt_id: dataDetail.cs_pt_id,
                sqd_qty: dataDetail.cs_qty,
                sqd_qty_allocated: 0,
                sqd_is_additional_charge: 'N',
                sqd_um: 9964,
                sqd_cost: dataDetail.total_cost,
                sqd_price: dataDetail.total_price,
                sqd_disc: dataDetail.discount,
                sqd_sales_ac_id: 13,
                sqd_sales_sb_id: 0,
                sqd_sales_cc_id: 0,
                sqd_um_conv: 1,
                sqd_qty_real: dataDetail.cs_qty,
                sqd_taxable: 'N',
                sqd_tax_inc: 'N',
                sqd_tax_class: 9949,
                sqd_dt: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                sqd_payment: 0,
                sqd_dp: 0,
                sqd_sales_unit: 0,
                sqd_loc_id: dataDetail.location_id,
                sqd_ppn_type: 'E',
                sqd_invc_oid: dataDetail.cs_invc_oid,
                sqd_invc_loc_id: dataDetail.location_id,
                sqd_need_date: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                sqd_qty_booking: dataDetail.cs_qty,
            };

            baseSequence += 1;
            return data;
        })

        return result;
    }

    sleep = (milliseconds) => {
        const now = new Date().getTime();
        while (new Date().getTime() < now + milliseconds) {
        }
    }

    packingCharges = (dataHeader, dataUser) => {
        let result = {
                sqd_oid: uuidv4(),
                sqd_dom_id: 1,
                sqd_en_id: dataHeader.sq_en_id,
                sqd_add_by: dataUser.usernama,
                sqd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sqd_sq_oid: dataHeader.sq_oid,
                sqd_seq: 0,
                sqd_si_id: 992,
                sqd_pt_id: 105,
                sqd_qty: 1,
                sqd_qty_allocated: 0,
                sqd_is_additional_charge: 'N',
                sqd_um: 9964,
                sqd_cost: 1,
                sqd_price: 7500,
                sqd_disc: 0,
                sqd_sales_ac_id: 13,
                sqd_sales_sb_id: 0,
                sqd_sales_cc_id: 0,
                sqd_um_conv: 1,
                sqd_qty_real: 1,
                sqd_taxable: 'N',
                sqd_tax_inc: 'N',
                sqd_tax_class: 9949,
                sqd_dt: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
                sqd_payment: 0,
                sqd_dp: 0,
                sqd_sales_unit: 0,
                sqd_loc_id: 100043,
                sqd_ppn_type: 'E',
                sqd_invc_oid: 'e1aaf876-4636-44fa-a1d7-6436a2885266',
                sqd_need_date: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
            };

        return result;
    }

    salesOrder = async (invoiceNumber) => {
        await sequelize.transaction(async t => {
            let [
                headerSalesQuotation, 
                detailSalesQuotation,
                totalData,
                serverCode
            ] = await Promise.all([
                SalesQuotationService.getHeaderSalesQuotation(invoiceNumber), 
                SalesQuotationService.getDetailSalesQuotation(invoiceNumber),
                SalesOrderService.generateTotalOrder(t),
                serverSetting(['server_code'])
            ]);

            let resultDataHeader = this.generateHeaderSalesOrder(headerSalesQuotation, totalData, serverCode);
            let resultDataDetail = this.generateDetailSalesOrder(detailSalesQuotation, resultDataHeader);

            await SalesOrderService.createHeaderOrder(resultDataHeader, t);
            this.sleep(5000)
            await SalesOrderService.createDetailOrder(resultDataDetail, t);

            info(`CREATE SALES ORDER`, 'SALES ORDER ALREADY CREATED!', resultDataHeader);
        })
    }

    generateHeaderSalesOrder = (data, totalData, serverCode) => {
        let result = [];
        let {dataValues: dataServer} = serverCode;

        for (const {dataValues: dataHeader} of data) {
            totalData += 1;

            result.push({
                so_oid: uuidv4(),
                so_dom_id: dataHeader.sq_dom_id,
                so_en_id: dataHeader.sq_en_id,
                so_add_by: dataHeader.sq_add_by,
                so_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                so_code: this.generateSalesOrderCode(dataHeader.sq_en_id, dataServer.server_code, totalData),
                so_ptnr_id_sold: dataHeader.sq_ptnr_id_sold,
                so_ptnr_id_bill: dataHeader.sq_ptnr_id_bill,
                so_date: moment().format('YYYY-MM-DD'),
                so_credit_term: dataHeader.sq_credit_term,
                so_taxable: dataHeader.sq_taxable,
                so_tax_class: dataHeader.sq_tax_class,
                so_si_id: dataHeader.sq_si_id,
                so_type: dataHeader.sq_type,
                so_sales_person: dataHeader.sq_sales_person,
                so_pi_id: dataHeader.sq_pi_id,
                so_pay_type: dataHeader.sq_pay_type,
                so_pay_method: dataHeader.sq_pay_method,
                so_ar_ac_id: dataHeader.sq_ar_ac_id,
                so_ar_sb_id: dataHeader.sq_ar_sb_id,
                so_ar_cc_id: dataHeader.sq_ar_cc_id,
                so_dp: dataHeader.sq_dp,
                so_disc_header: dataHeader.sq_disc_header,
                so_total: dataHeader.sq_total,
                so_payment_date: moment().format('YYYY-MM-DD'),
                so_tran_id: dataHeader.sq_tran_id,
                so_trans_id: 'D',
                so_trans_rmks: dataHeader.sq_trans_rmks,
                so_dt: moment().format('YYYY-MM-DD'),
                so_cu_id: dataHeader.sq_cu_id,
                so_total_ppn: dataHeader.sq_total_ppn,
                so_total_pph: dataHeader.sq_total_pph,
                so_payment: dataHeader.sq_payment,
                so_exc_rate: dataHeader.sq_exc_rate,
                so_tax_inc: dataHeader.sq_tax_inc,
                so_cons: dataHeader.sq_cons,
                so_terbilang: dataHeader.sq_terbilang,
                so_bk_id: dataHeader.sq_bk_id,
                so_interval: dataHeader.sq_interval,
                so_ppn_type: dataHeader.sq_ppn_type,
                so_is_package: dataHeader.sq_is_package,
                so_manufactures: 'N',
                so_pt_id: dataHeader.sq_pt_id,
                so_project: 'N',
                so_total_final: dataHeader.sq_total,
                so_booking: 'Y',
                so_sq_ref_oid: dataHeader.sq_oid,
                so_sq_ref_code: dataHeader.sq_code,
                so_ptsfr_loc_id: dataHeader.sq_ptsfr_loc_id,
                so_ptsfr_loc_to_id: dataHeader.sq_ptsfr_loc_to_id,
                so_ptsfr_loc_git: dataHeader.sq_ptsfr_loc_git,
                so_alocated: 'N',
                so_status_packing: 'N'
            })
        }

        return result;
    }

    generateDetailSalesOrder = (data, dataHeader) => {
        let result = [];

        for (const {dataValues: dataDetail} of data) {
            let [header] = dataHeader.filter(dataHeader1 => dataHeader1.so_sq_ref_oid == dataDetail.sqd_sq_oid);

            result.push({
                sod_oid: uuidv4(),
                sod_dom_id: dataDetail.sqd_dom_id,
                sod_en_id: dataDetail.sqd_en_id,
                sod_add_by: dataDetail.sqd_add_by,
                sod_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                sod_so_oid: header.so_oid,
                sod_seq: dataDetail.sqd_seq,
                sod_is_additional_charge: 'N',
                sod_si_id: dataDetail.sqd_si_id,
                sod_pt_id: dataDetail.sqd_pt_id,
                sod_rmks: dataDetail.sqd_rmks,
                sod_qty: dataDetail.sqd_qty,
                sod_qty_allocated: dataDetail.sqd_qty,
                sod_um: dataDetail.sqd_um,
                sod_cost: dataDetail.sqd_cost,
                sod_price: dataDetail.sqd_price,
                sod_disc: dataDetail.sqd_disc,
                sod_sales_ac_id: dataDetail.sqd_sales_ac_id,
                sod_sales_sb_id: dataDetail.sqd_sales_sb_id,
                sod_sales_cc_id: dataDetail.sqd_sales_cc_id,
                sod_um_conv: dataDetail.qod_um_conv,
                sod_qty_real: dataDetail.sqd_qty_real,
                sod_taxable: dataDetail.sqd_taxable,
                sod_tax_inc: dataDetail.sqd_tax_inc,
                sod_tax_class: dataDetail.sqd_tax_class,
                sod_dt: moment().format('YYYY-MM-DD HH:mm:ss'),
                sod_payment: dataDetail.sqd_payment,
                sod_dp: dataDetail.sqd_dp,
                sod_sales_unit: dataDetail.sqd_sales_unit,
                sod_loc_id: dataDetail.sqd_loc_id,
                sod_ppn_type: dataDetail.sqd_ppn_type,
                sod_invc_oid: dataDetail.sqd_invc_oid,
                sod_invc_loc_id: dataDetail.sqd_invc_loc_id,
                sod_sqd_oid: dataDetail.sqd_oid,
                sod_qty_open: dataDetail.sqd_qty,
                sod_qty_booked: dataDetail.sqd_qty
            })
        }

        return result;
    }

    generateSalesOrderCode = (entity, serverCode, rawSequence) => {
        let soCode = 'SO';
        let entityCode = `${entity}0`;
        let yearMonth = moment().format('YYMM');
        let monthCode = '0000';
        let baseSequence = '0000';
        let sequence = baseSequence.slice(0, -rawSequence.toString().length) + rawSequence;

        return `${soCode}${entityCode}${yearMonth}${serverCode}${monthCode}${sequence}`
    }

    configurationSoDirectly = async () => {
        let result = await TConfSetting.findOne({
            attributes: ['so_directly']
        });

        return result.dataValues.so_directly;
    }
}

module.exports = new CheckoutController();