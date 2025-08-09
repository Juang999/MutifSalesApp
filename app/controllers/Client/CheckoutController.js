const moment = require('moment');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {sequelize} = require('../../../models');
const Bilangan = require('../../../helper/Bilangan');
const {errorResponse} = require('../../../helper/Helper');
const ServerSetting = require('../../../helper/SettingServer');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {CartService, SalesQuotationService, PartnerService} = require('../../services/ServiceContainer');

class CheckoutController {
    checkOut = (req, res) => {
        const dataUser = Auth.user();

        sequelize.transaction(async t => {
            let [dataLocation, dataHeaderSq, dataBodySq] = await Promise.all([
                PartnerService.getLocationPartner(dataUser.user_ptnr_id),
                CartService.getDataHeaderSalesQuotation(dataUser.userid, 'N', 'N'), 
                CartService.getDataDetailSalesQuotation(dataUser.userid, 'N', 'N'),
            ])

            let dataPartner = null;
            if (req.body.referral_code && req.body.referral_code != '-') {
                let resultDataPartner = await PartnerService.getPartnerReference(req.body.referral_code);

                if (resultDataPartner == null) {
                    return {
                        statusCode: 404,
                        json: {
                            status: 'failed',
                            message: 'partner not found',
                            data: null,
                            error: null
                        }
                    }
                } else {
                    dataPartner = resultDataPartner;
                }
            }

            if (dataHeaderSq.length == 0) {
                return {
                    statusCode: 300,
                    json: {
                        status: 'failed',
                        message: 'tidak ada barang pesanan',
                        data: null,
                        error: null
                    }
                }
            }

            let headerSalesQuotation = await this.generateHeaderSalesQuotation(dataHeaderSq, req.body, dataLocation, dataUser, dataPartner);
            let detailSalesQuotation = this.generateDetailSalesQuotation(dataBodySq, headerSalesQuotation, dataUser);
            headerSalesQuotation[0]['sq_shipping_charges'] = req.body.shipping_cost;

            if (req.body.transaction_type == 'Y' && dataUser.groupid == 9911) {
                headerSalesQuotation[0]['sq_total'] = parseInt(headerSalesQuotation[0]['sq_total']) + 7500;
                detailSalesQuotation.push(this.packingCharges(headerSalesQuotation[0], dataUser));
            }

            await SalesQuotationService.bulkInsertHeaderSalesQuotation(headerSalesQuotation, t);
            this.sleep(1000)
            await SalesQuotationService.bulkInsertDetailSalesQuotation(detailSalesQuotation, t);
            await CartService.bulkDeleteDataCart(dataBodySq, dataUser, t);

            return {
                statusCode: 200,
                json: {
                    status:'success',
                    message: 'ok',
                    data: true,
                    error: null
                }
            }
        })
        .then(result => {
            info('CHECKOUT PRODUCTS', `${Auth.user().usernama} HAS CHECKED OUT!`, true);

            res.status(result.statusCode)
                .json(result.json)
        })
        .catch(err => {
            errorLog('CHECKOUT PRODUCTS', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: errorResponse(err.message)
                });
        })
    }

    generateHeaderSalesQuotation = async (dataHeader, formBody, dataLocation, user, partnerReference) => {
        let sequenceNumber = 0;
        let totalSQofTheMonth = await SalesQuotationService.countDataSalesQuotation();
        let {dataValues: dataServer} = await ServerSetting.get(['server_code']);

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
                sq_sales_person: user.user_ptnr_id,
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
                sq_trans_id: 'D',
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
}

module.exports = new CheckoutController();