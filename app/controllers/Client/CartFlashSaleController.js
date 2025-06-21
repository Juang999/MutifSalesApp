const Auth = require('../../../helper/Auth');
const { sequelize } = require('../../../models');
const { errorV2: errorLog } = require('../../../helper/Logging');
const {
    InventoryService, CartService, 
} = require('../../services/ServiceContainer');
const { expireData } = require('./SalesV2Controller');

class CartFlashSaleController {
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

                let [dataQtyProduct, qtySerials, dataCart] = await Promise.all([
                    InventoryService.getDataInventory(inventoryOid, t),
                    InventoryService.qtySerials(productId, inventoryOid),
                    CartService.findDataCart(productId, inventoryOid, userid, 'N'), 
                ]);

                if (parseInt(qtySerials) - parseInt(quantity) < 0) {
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
                        CartService.inputIntoCart(bodyCart, dataUser, 'N', 'Y', t),
                        InventoryService.bookSerials(productId, inventoryOid, quantity, t),
                        InventoryService.bookProductQuantity(inventoryOid, qtyInventory, t)
                    ])
                } else {
                    let cartSalesOid = dataCart.dataValues.cs_oid;
                    let cartQty = (dataCart.dataValues.cs_trans_id == 'E') ? parseInt(quantity) : parseInt(dataCart.dataValues.cs_qty) + parseInt(quantity);

                    await Promise.all([
                        CartService.updateCart(cartSalesOid, cartQty, dataCart.dataValues.cs_trans_id, t),
                        InventoryService.bookSerials(productId, inventoryOid, quantity, t),
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

            let result = await CartService.retrieveDataCart(userid, 'N', ptnrg_id, 'Y');

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

            let dataCart = await CartService.retrieveDataCartByProductId(product_id, userId, 'N', 'Y');

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

    deleteDataChart = async (dataCartSales, dataInventory, dataUser, transaction) => {
        let qtyInventory = {
            quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(dataCartSales.cs_qty),
            quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(dataCartSales.cs_qty)
        }

        if (dataCartSales.cs_trans_id == 'D') {
            await Promise.all([
                InventoryService.bookProductQuantity(dataCartSales.cs_invc_oid, qtyInventory, transaction),
                InventoryService.releaseSerials(dataCartSales.cs_pt_id, dataCartSales.cs_invc_oid, dataCartSales.cs_qty, transaction),
                CartService.deleteDataCart(dataCartSales.cs_oid, dataUser, transaction)
            ])
        } else {
            await CartService.deleteDataCart(dataCartSales.cs_oid, dataUser, transaction)
        }
    }
}

module.exports = new CartFlashSaleController();