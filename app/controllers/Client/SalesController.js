const axios = require('axios');
const Auth = require('../../../helper/Auth');
const {config} = require('../../../config/environment');
const {error: errorLog} = require('../../../helper/Logging');
const {
    InvcdDet,
    SqMstr, sequelize,
    ChartSales, InvcMstr,
} = require('../../../models');
const {insertQuery, insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {
    updateStatusTransction, bulkReleaseQuantity, 
} = require('../../modules/Stock/controllers/StockProductController');
const {InventoryService, CartService} = require('../../services/ServiceContainer');

class SalesController {
    inputIntoChart = async (req, res) => {
        try {
            const {body} = req;
            const {userid, user_ptnr_id} = Auth.user();
            const {
                pi_id: priceListId,
                pt_id: productId, en_id: entityId, 
                invc_oid: inventoryOid, qty: quantity, 
            } = body;
        
            let transaction = await sequelize.transaction(async t => {
                let dataCart = await CartService.findDataCart(productId, userid);
                let dataQtyProduct = await InventoryService.getDataInventory(inventoryOid, t);

                if (dataQtyProduct.dataValues.qty_available - parseInt(quantity) <= 0) {
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

                await InventoryService.bookProductQuantity(inventoryOid, {
                    quantityAvailable: dataQtyProduct.dataValues.qty_available - parseInt(quantity),
                    quantityBooked: dataQtyProduct.dataValues.qty_booked + parseInt(quantity),
                }, t)
        
                if (!dataCart) {
                    await CartService.inputIntoCart({productId, entityId, inventoryOid, quantity: parseInt(quantity), priceListId}, userid, t)
                } else {
                    await CartService.updateCart(dataCart.dataValues.cs_oid, parseInt(dataCart.dataValues.cs_qty) + parseInt(quantity), t)
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

        CartService.retrieveDataCart(userid)
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

    updateChart = async (req, res) => {
        try {
            let {userid} = Auth.user();
            let {cart_oid} = req.params;
            let {qty} = req.body;

            let transaction = await sequelize.transaction(async t => {
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

            res.status(transaction.statusCode)
                    .json(transaction.json);
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

    deleteChart = async (req, res) => {
        try {
            let {cart_oid} = req.params;
            let {userid} = Auth.user();

            const transaction = await sequelize.transaction(async t => {
                let {dataValues: dataCart} = await CartService.findDataCartByOid(cart_oid, userid);
                let {dataValues: dataInventory} = await InventoryService.getDataInventory(dataCart.cs_invc_oid, t);

                await this.deleteDataChart(dataCart, dataInventory, userid, t);

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

            res.status(transaction.statusCode)
                .json(transaction.json);
        } catch (error) {
            errorLog('DELETE DATA CART', error.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    readyToCheckout = (req, res) => {
        let {userid} = Auth.user();

        CartService.retrieveDataToCheckout(userid)
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
        try {
            await SqMstr.update({
                sq_midtrans_inv_status: req.body.payment_status
            }, {
                where: {
                    sq_midtrans_inv_number: req.params.invoice,
                    sq_ptnr_id_sold: Auth.user().user_ptnr_id
                },
                logging: async (sql, {bind}) => {
                    await insertQuery(sql, bind);
                }
            })

            if (req.body.payment_status == 'cancel' || req.body.payment_status == 'failure') {
                await this.releaseProduct(req.params.invoice)
            } else {
                await updateStatusTransction(req.body.payment_status, req.params.invoice)
            }

            res.status(200)
                .json({
                    status: 'success',
                    message: 'updated!',
                    data: null,
                    error: null
                })
        } catch (error) {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        }
    }

    deleteDataChart = async (dataCartSales, dataInventory, userId, transaction) => {
        await InventoryService.bookProductQuantity(dataCartSales.cs_invc_oid, {
            quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(dataCartSales.cs_qty),
            quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(dataCartSales.cs_qty)
        }, transaction)

        await CartService.deleteDataCart(dataCartSales.cs_oid, userId, transaction);
    }

    increaseQtyCart = async (dataCartSales, dataInventory, quantity, transaction) => {
        let resultQuantity = parseInt(quantity) - parseInt(dataCartSales.cs_qty)

        await InventoryService.bookProductQuantity(dataInventory.invc_oid, {
            quantityAvailable: parseInt(dataInventory.qty_available) - parseInt(resultQuantity),
            quantityBooked: parseInt(dataInventory.qty_booked) + parseInt(resultQuantity)
        }, transaction)

        await CartService.updateCart(dataCartSales.cs_oid, parseInt(quantity), transaction);
    }

    decreaseDataCart = async (dataCartSales, dataInventory, quantity, transaction) => {
        let resultQuantity = parseInt(dataCartSales.cs_qty) - parseInt(quantity)

        await InventoryService.bookProductQuantity(dataInventory.invc_oid, {
            quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(resultQuantity),
            quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(resultQuantity)
        }, transaction)

        await CartService.updateCart(dataCartSales.cs_oid, parseInt(quantity), transaction);
    }

    increaseQtyInventory = async (cartSalesOid, transaction) => {
        await InvcdDet.update({
            invcd_is_booked: null,
            invcd_cs_oid: null
        }, {
            where: {
                invcd_cs_oid: cartSalesOid
            },
            transaction,
            logging: (sqlCommand, {bind}) => {
                let result = sqlCommand.split(': ');
                insertQuery(result[1], bind);
            },
        });
    }

    updateQtyInventory = async (invcOid, qtyAvailable, qtyBooked, transaction) => {
        let result = await InvcMstr.update({
                invc_qty_available: qtyAvailable,
                invc_qty_booked: qtyBooked,
                invc_qty_old: qtyAvailable
            }, {
                where: {
                    invc_oid: invcOid
                },
                logging: async (sql, {bind}) => {
                    await insertQuery(sql.split(':')[1], bind)
                },
                transaction
            })
    }

    getDataCart = async (cartSalesOid, transaction) => {
        let data = await ChartSales.findOne({
            attributes: [
                'cs_oid',
                'cs_invc_oid',
                'cs_qty',
                'cs_pt_id'
            ],
            where: {
                cs_oid: cartSalesOid
            },
            logging: false
        })

        return data;
    }

    releaseProduct = async (invoice) => {
        await InvcdDet.update({
            invcd_is_booked: null,
            invcd_transaction_code: null
        }, {
            where: {
                invcd_transaction_code: invoice
            }
        })
    }
}

module.exports = new SalesController();