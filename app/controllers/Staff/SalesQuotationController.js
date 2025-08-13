let { SalesQuotationService } = require('../../services/ServiceContainer');
let { v4: uuidv4 } = require('uuid');
const { SqMstr, SqdDet } = require('../../../models');
const moment = require('moment');

class SalesQuotationController {
    getDataSalesQuotation = ( req, res ) => {
        let search = req.query.search || '';
        let startDate = req.query.start_date || moment().startOf('month').format('YYYY-MM-DD');
        let endDate = req.query.end_date || moment().endOf('month').format('YYYY-MM-DD');

        SalesQuotationService.getAllHeaderSalesQuotation(search, startDate, endDate)
        .then(result => {
            res.status(200).json({
                status: 'success',
                message: 'ok',
                data: result,
                error: null
            })
        })
        .catch(err => {
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve sales quotations',
                data: null,
                error: err.message
            });
        })
    }

    getDetailDataSalesQuotation = (req, res) => {
        Promise.all([
            SalesQuotationService.adminGetHeaderInvoice(req.params.invoice_number), 
            SalesQuotationService.adminGetDetailInvoice(req.params.invoice_number)
        ])
        .then(([headerInvoice, detailInvoice]) => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        invoice: headerInvoice.invoice,
                        date: headerInvoice.date,
                        partner_name: headerInvoice.partner_name,
                        partner_address: headerInvoice.partner_address,
                        partner_phone: headerInvoice.partner_phone,
                        partner_email: headerInvoice.partner_email,
                        sales_person: headerInvoice.sales_person,
                        dropshipper: headerInvoice.dropshipper,
                        remarks: headerInvoice.remarks,
                        payment_type: headerInvoice.payment_type,
                        shipping_name: headerInvoice.shipping_name,
                        shipping_service: headerInvoice.shipping_service,
                        shipping_charges: headerInvoice.shipping_charges,
                        status: headerInvoice.status,
                        products: detailInvoice
                    },
                    error: null
                })
        })
        .catch(err => {
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve sales quotation details',
                data: null,
                error: err.message
            });
        });
    }

    checkOut = async () => {
        try {
            let heaerSalesQuotation = {
                sq_oid: uuidv4(),
                sq_dom_id: 1,
                sq_en_id,
                sq_add_by,
                sq_add_date,
                sq_code,
                sq_ptnr_id_sold,
                sq_ptnr_id_bill,
                sq_date,
                sq_credit_term,
                sq_taxable,
                sq_tax_class,
                sq_si_id,
                sq_type,
                sq_sales_person,
                sq_pi_id,
                sq_pay_type,
                sq_pay_method,
                sq_dp,
                sq_disc_header,
                sq_total,
                sq_dt,
                sq_cu_id,
                sq_total_ppn,
                sq_total_pph,
                sq_payment,
                sq_exc_rate,
                sq_tran_id,
                sq_trans_id,
                sq_terbilang,
                sq_tax_inc,
                sq_cons,
                sq_interval,
                sq_ar_ac_id,
                sq_ar_sb_id,
                sq_ar_cc_id,
                sq_need_date,
                sq_is_package,
                sq_sales_program,
                sq_booking,
                sq_book_start_date,
                sq_book_end_date,
                sq_alocated,
                sq_shipping_charges,
                sq_ptsfr_loc_id,
                sq_ptsfr_loc_to_id,
                sq_ptsfr_loc_git,
                sq_en_to_id,
                sq_dropshipper,
                sq_pi_area_id,
                sq_dg_group,
                sq_shipping_name,
                sq_midtrans_inv_number,
                sq_midtrans_inv_status,
                sq_shipping_service,
            }
        } catch (error) {
            
        }
    }
}

module.exports = new SalesQuotationController();