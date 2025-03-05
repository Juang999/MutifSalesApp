const moment = require('moment');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {info, error: errorLog} = require('../../../helper/Logging');
const {sequelize} = require('../../../models');
const Bilangan = require('../../../helper/Bilangan');
const ServerSetting = require('../../../helper/SettingServer');
const {InventoryService, CartService, SalesQuotationService} = require('../../services/ServiceContainer');

class CheckoutController {
    checkOut = async (req, res) => {
        const dataUser = Auth.user();

        try {
            let RAW_DATA_HEADER_SQ = CartService.getDataHeaderSalesQuotation(dataUser.userid);
            let RAW_DATA_BODY_SQ = CartService.getDataDetailSalesQuotation(dataUser.userid);

            let [dataHeaderSq, dataBodySq] = await Promise.all([RAW_DATA_HEADER_SQ, RAW_DATA_BODY_SQ])

            let transaction = await sequelize.transaction(async t => {
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

                let headerSalesQuotation = await this.generateHeaderSalesQuotation(dataHeaderSq, req.body, dataUser);
                let detailSalesQuotation = this.generateDetailSalesQuotation(dataBodySq, headerSalesQuotation, dataUser);
                headerSalesQuotation[0]['sq_shipping_charges'] = req.body.shipping_cost;
    
                await SalesQuotationService.bulkInsertHeaderSalesQuotation(headerSalesQuotation, t);
                this.sleep(1000)
                await SalesQuotationService.bulkInsertDetailSalesQuotation(detailSalesQuotation, t);
                await CartService.bulkDeleteDataCart(dataBodySq, dataUser.userid, t);

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

            info('CHECKOUT PRODUCTS', `${Auth.user().usernama} HAS CHECKED OUT!`, true);

            res.status(transaction.statusCode)
                .json(transaction.json)
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

    generateHeaderSalesQuotation = async (dataHeader, formBody, user) => {
        let SEQUENCE_NUMBER = 0;
        let TOTAL_SQ_THIS_MONTH = await SalesQuotationService.countDataSalesQuotation();
        let {dataValues: dataServer} = await ServerSetting.get(['serv_code']);

        let {serv_code: SERVER_CODE} = dataServer;

        let dataHeadersSalesQuotation = dataHeader.map(({dataValues}) => {
            let {
                discount,
                loc_id: locationId,
                cs_pi_id: priceListId,
                loc_git: locationGit,
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
                sq_cons: formBody.is_consigment,
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
                sq_ptsfr_loc_git: locationGit,
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

    sleep = (milliseconds) => {
        const now = new Date().getTime();
        while (new Date().getTime() < now + milliseconds) {
        }
    }
}

module.exports = new CheckoutController();