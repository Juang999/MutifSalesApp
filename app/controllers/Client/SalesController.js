const moment = require('moment');
const Auth = require('../../../helper/Auth');
const {sequelize} = require('../../../models');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {
    InventoryService, CartService, 
    SalesQuotationService, SalesOrderService
} = require('../../services/ServiceContainer');
const {v4: uuidv4} = require('uuid');
const {serverSetting} = require('../../../helper/Helper');
const {expireData} = require('./SalesV2Controller');

class SalesController {
    inputIntoChart = async (req, res) => {
        try {
            const {body} = req;
            const {userid, usernama: username} = Auth.user();

            const {
                pi_id: priceListId,
                pt_id: productId, en_id: entityId, 
                invc_oid: inventoryOid, qty: quantity, 
            } = body;
        
            let transaction = await sequelize.transaction(async t => {
                await expireData(userid);

                let [dataQtyProduct, dataCart] = await Promise.all([
                    InventoryService.getDataInventory(inventoryOid, t),
                    CartService.findDataCart(productId, inventoryOid, userid, 'N'), 
                ]);

                if (parseInt(dataQtyProduct.dataValues.qty_available) - parseInt(quantity) < 0) {
                    return {
                        statusCode: 409,
                        json: {
                            status: 'failed',
                            message: 'Stok barang habis',
                            data: null,
                            error: null
                        }
                    }
                }

                let qtyInventory = {
                    quantityAvailable: parseInt(dataQtyProduct.dataValues.qty_available) - parseInt(quantity),
                    quantityBooked: parseInt(dataQtyProduct.dataValues.qty_booked) + parseInt(quantity)
                }

                if (!dataCart) {
                    let dataUser = {userid, username};
                    let bodyCart = {productId, entityId, inventoryOid, priceListId, quantity: parseInt(quantity)};

                    await Promise.all([
                        CartService.inputIntoCart(bodyCart, dataUser, 'N', 'N', t),
                        InventoryService.bookProductQuantity(inventoryOid, qtyInventory, t)
                    ])
                } else {
                    let cartSalesOid = dataCart.dataValues.cs_oid;
                    let cartQty = (dataCart.dataValues.cs_trans_id == 'E') ? parseInt(quantity) : parseInt(dataCart.dataValues.cs_qty) + parseInt(quantity);

                    await Promise.all([
                        CartService.updateCart(cartSalesOid, cartQty, dataCart.dataValues.cs_trans_id, t),
                        InventoryService.bookProductQuantity(inventoryOid, qtyInventory, t)
                    ])
                }

                return {
                    statusCode: 200,
                    json: {
                        status: 'success',
                        message: 'produk berhasil diinput',
                        data: true,
                        error: null
                    }
                }
            });

            res.status(transaction.statusCode)
                .json(transaction.json)
        } catch (error) {
            errorLog('INPUT INTO CART', error.message);

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
            let {userid, ptnrg_id} = Auth.user();
            await expireData(userid);

            let result = await CartService.retrieveDataCart(userid, 'N', ptnrg_id, 'N');

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            errorLog('GET CART', error.message)
    
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    updateChart = (req, res) => {
        let {userid} = Auth.user();
        let {cart_oid} = req.params;
        let {qty} = req.body;

        sequelize.transaction(async t => {
            await expireData(userid);

            let {dataValues: dataCart} = await CartService.findDataCartByOid(cart_oid, userid);
            let {dataValues: dataInventory} = await InventoryService.getDataInventory(dataCart.cs_invc_oid, t)

            if (parseInt(qty) > parseInt(dataCart.cs_qty)) {
                await this.increaseQtyCart(dataCart, dataInventory, qty, t);
            } else if (parseInt(qty) < parseInt(dataCart.cs_qty) && parseInt(qty) != 0) {
                await this.decreaseDataCart(dataCart, dataInventory, qty, t);
            } else if (parseInt(qty) == 0) {
                await this.deleteDataChart(dataCart, dataInventory, userid, t);
            }

            return {
                statusCode: 200,
                json: {
                    status:'success',
                    message: 'updated!',
                    data: null,
                    error: null
                }
            }
        })
        .then(result => {
            res.status(result.statusCode)
                    .json(result.json);
        })
        .catch(err => {
            errorLog('UPDATE CHART', err.message)

                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'error',
                        data: null,
                        error: err.message
                    })
        })
    }

    deleteChart = async (req, res) => {
        let {product_id} = req.params;
        let {userid: userId, usernama: userName} = Auth.user();

        sequelize.transaction(async t => {
            await expireData(userId)

            let dataCart = await CartService.retrieveDataCartByProductId(product_id, userId, 'N', 'N');

            for (const {dataValues: singularDataCart} of dataCart) {
                let {dataValues: dataInventory} = await InventoryService.getDataInventory(singularDataCart.cs_invc_oid, t);

                await this.deleteDataChart(singularDataCart, dataInventory, {userId, userName}, t);
            }

            return {
                statusCode: 200,
                json: {
                    status:'success',
                    message: 'deleted!',
                    data: null,
                    error: null
                }
            }
        })
        .then(result => {
            res.status(result.statusCode)
                .json(result.json);
        })
        .catch(err => {
            errorLog('DELETE DATA CART', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    readyToCheckout = async (req, res) => {
        try {
            let {userid, ptnrg_id} = Auth.user();
            await expireData(userid);

            let [dataUser, dataCart] = await Promise.all([
                CartService.retrieveDataToCheckout(userid, ptnrg_id, 'D', 'N'),
                CartService.getDataCartForCheckout(userid)
            ])

            dataUser.dataValues.chart_sales = dataCart;

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: dataUser,
                    error: null
                })
        } catch (error) {
            errorLog('GET DETAIL USER', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    updatePaymentStatus = async (req, res) => {
        let {invoice} = req.params;
        let {payment_status} = req.body;

        sequelize.transaction(async t => {            
            let dataProducts = await SalesQuotationService.getBookedProductByInvoiceNumber(invoice);

            if (payment_status == 'cancel' || payment_status == 'failure' || payment_status == 'expire') {
                await SalesQuotationService.updatePaymentStatus(invoice, payment_status, 'X', t);

                for (const {dataValues: singular} of dataProducts) {
                    let {dataValues: dataInventory} = await InventoryService.getDataInventory(singular.sqd_invc_oid, t);

                    await InventoryService.bookProductQuantity(singular.sqd_invc_oid, {
                        quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(singular.sqd_qty_real),
                        quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(singular.sqd_qty_real)
                    }, t)
                }
            } else {
                await SalesQuotationService.updatePaymentStatus(invoice, payment_status, 'D', t);
                await this.salesOrder(invoice);
            }

            return {
                statusCode: 200,
                json: {
                    status:'success',
                    message: 'updated!',
                    data: null,
                    error: null
                }
            }
        })
        .then(result => {
            res.status(result.statusCode)
                .json(result.json)
        })
        .catch(err => {
            errorLog('UPDATE PAYMENT STATUS', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getInvoiceNumber = (req, res) => {
        let startDate = (req.query.start_date) ? moment(req.query.start_date).format('YYYY-MM-DD HH:mm:ss') : moment().startOf('months').format('YYYY-MM-DD HH:mm:ss')
        let endDate = (req.query.end_date) ? moment(req.query.end_date).format('YYYY-MM-DD HH:mm:ss') : moment().endOf('months').format('YYYY-MM-DD HH:mm:ss')
        let search = (req.query.search) ? req.query.search : '';
        let {user_ptnr_id} = Auth.user()

        SalesQuotationService.retrieveDataInvoice({startDate, endDate}, search, user_ptnr_id)
        .then(result => {
            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog('GET INVOICE NUMBER', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getDetailInvoiceNumber = (req, res) => {
        let {user_ptnr_id} = Auth.user();

        Promise.all([
            SalesQuotationService.getHeaderInvoice(req.params.invoice, user_ptnr_id), 
            SalesQuotationService.getDetailInvoice(req.params.invoice, user_ptnr_id)
        ]).then(([headerInvoice, detailInvoice]) => {
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
                        payment_type: headerInvoice.payment_type,
                        shipping_name: headerInvoice.shipping_name,
                        shipping_service: headerInvoice.shipping_service,
                        shipping_charges: headerInvoice.shipping_charges,
                        status: headerInvoice.status,
                        products: detailInvoice
                    },
                    error: null
                })
        }).catch(err => {
            errorLog('GET DETAIL INVOICE NUMBER', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    invoiceNumberSequence = (req, res) => {
        let startDay = moment().format('YYYY-MM-DD 00:00:00');
        let endDay = moment().format('YYYY-MM-DD 23:59:59');

        SalesQuotationService.getSequenceInvoiceNumber({startDay, endDay})
        .then(([countedData]) => {
            let baseNumber = '0000';
            let dataSequence = countedData.dataValues.invoice_number;
            let invoiceNumber = baseNumber.slice(0, -dataSequence.toString().length) + dataSequence;

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {invoice_number: invoiceNumber},
                    error: null
                }) 
        })
        .catch(err => {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    deleteDataChart = async (dataCartSales, dataInventory, dataUser, transaction) => {
        let qtyInventory = {
            quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(dataCartSales.cs_qty),
            quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(dataCartSales.cs_qty)
        }

        if (dataCartSales.cs_trans_id == 'D') {
            await Promise.all([
                InventoryService.bookProductQuantity(dataCartSales.cs_invc_oid, qtyInventory, transaction),
                CartService.deleteDataCart(dataCartSales.cs_oid, dataUser, transaction)
            ])
        } else {
            await CartService.deleteDataCart(dataCartSales.cs_oid, dataUser, transaction)
        }
    }

    increaseQtyCart = async (dataCartSales, dataInventory, quantity, transaction) => {
        let resultQuantity = parseInt(quantity) - parseInt(dataCartSales.cs_qty)
        let qtyInventory = {
            quantityAvailable: parseInt(dataInventory.qty_available) - parseInt(resultQuantity),
            quantityBooked: parseInt(dataInventory.qty_booked) + parseInt(resultQuantity)
        }

        await Promise.all([
            InventoryService.bookProductQuantity(dataInventory.invc_oid, qtyInventory, transaction),
            CartService.updateCart(dataCartSales.cs_oid, parseInt(quantity), transaction)
        ])

    }

    decreaseDataCart = async (dataCartSales, dataInventory, quantity, transaction) => {
        let resultQuantity = parseInt(dataCartSales.cs_qty) - parseInt(quantity)
        let qtyInventory = {
            quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(resultQuantity),
            quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(resultQuantity)
        }

        await Promise.all([
            InventoryService.bookProductQuantity(dataInventory.invc_oid, qtyInventory, transaction),
            CartService.updateCart(dataCartSales.cs_oid, parseInt(quantity), transaction)
        ])
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

    sleep = (milliseconds) => {
        const now = new Date().getTime();
        while (new Date().getTime() < now + milliseconds) {
        }
    }
}

module.exports = new SalesController();