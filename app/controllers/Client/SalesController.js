const moment = require('moment');
const Auth = require('../../../helper/Auth');
const {sequelize,} = require('../../../models');
const {errorV2: errorLog} = require('../../../helper/Logging');
const {InventoryService, CartService, SalesQuotationService} = require('../../services/ServiceContainer');

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
                let [dataQtyProduct, dataCart] = await Promise.all([
                    InventoryService.getDataInventory(inventoryOid, t),
                    CartService.findDataCart(productId, inventoryOid, userid), 
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
                        CartService.inputIntoCart(bodyCart, dataUser, 'N', t),
                        InventoryService.bookProductQuantity(inventoryOid, qtyInventory, t)
                    ])
                } else {
                    let cartSalesOid = dataCart.dataValues.cs_oid;
                    let cartQty = parseInt(dataCart.dataValues.cs_qty) + parseInt(quantity);

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

    getDataChart = (req, res) => {
        let {userid} = Auth.user();

        CartService.retrieveDataCart(userid, 'D', 'N')
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
            errorLog('GET CHART', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    updateChart = (req, res) => {
        let {userid} = Auth.user();
        let {cart_oid} = req.params;
        let {qty} = req.body;

        sequelize.transaction(async t => {
            let {dataValues: dataCart} = await CartService.findDataCartByOid(cart_oid, userid);
            let {dataValues: dataInventory} = await InventoryService.getDataInventory(dataCart.cs_invc_oid, t)

            if (parseInt(qty) > parseInt(dataCart.cs_qty)) {
                console.info(qty)
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
            let dataCart = await CartService.retrieveDataCartByProductId(product_id, userId, 'N');

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

    buyBack = async (req, res) => {
        res.status(200)
            .json({
                status:'success',
                message: 'ok',
                data: 'berhasil membeli kembali',
                error: null
            })
    }

    readyToCheckout = (req, res) => {
        let {userid} = Auth.user();

        CartService.retrieveDataToCheckout(userid, 'D', 'N')
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
        let {invoice} = req.params;
        let {payment_status} = req.body;
        let {user_ptnr_id} = Auth.user();

        sequelize.transaction(async t => {
            await SalesQuotationService.updatePaymentStatus(invoice, payment_status, user_ptnr_id, t);

            let dataProducts = await SalesQuotationService.getBookedProductByInvoiceNumber(invoice);

            if (payment_status == 'cancel' || payment_status == 'failure') {
                for (const {dataValues: singular} of dataProducts) {
                    let {dataValues: dataInventory} = await InventoryService.getDataInventory(singular.sqd_invc_oid, t);

                    await InventoryService.bookProductQuantity(singular.sqd_invc_oid, {
                        quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(singular.sqd_qty_real),
                        quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(singular.sqd_qty_real)
                    }, t)
                }
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
}

module.exports = new SalesController();