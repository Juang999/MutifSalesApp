const axios = require('axios');
const {Op, InvalidConnectionError} = require('sequelize');
const Auth = require('../../../helper/Auth');
const {config} = require('../../../config/environment');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {
    InvcdDet,
    PiddDet, sequelize,
    PtMstr, PidDet, Sequelize, 
    ChartSales, PiMstr, InvcMstr,
    ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');
const {InventoryService, CartService} = require('../../services/ServiceContainer');

class SalesV2Controller {
    getChart = async (req, res) => {
        try {
            let {userid} = Auth.user();
            let transId = (req.query.expired == 'Y') ? 'E' : 'D';

            await this.expireData(userid);

            let result = await CartService.retrieveDataCart(userid, 'N')
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            errorLog('GET DATA CART V2', error.message);
    
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
            
        }
    }

    getExpiredDataChart = (req, res) => {
        let {userid} = Auth.user();

        CartService.retrieveDataCart(userid, 'E', 'N')
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
            errorLog('GET EXPIRED DATA CART', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        });
    }

    getLimitedCart = async (req, res) => {
        try {
            let {userid} = Auth.user();

            await this.expireData(userid);

            let [subTotalPrice, dataCart] = await Promise.all([
                CartService.getSubTotalPriceCart(userid, 'D', 'N'), 
                CartService.retrieveLimitedDataCart(userid, 'D', 'N')
            ]);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        subtotal_price: subTotalPrice[0]['sum'],
                        cart: dataCart
                    },
                    error: null
                })
        } catch (error) {
            errorLog(`GET LIMITED DATA CART`, err.message)
    
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        }
    }

    getDetailDataCart = async (req, res) => {
            try {
                let dataCart = await CartService.getDetailDataCart(req.params.product_id, Auth.user().userid, 'N');
                let dataInventory = await InventoryService.getDataInventoryByProductIdAndEntityId(dataCart.dataValues.cs_pt_id, parseInt(dataCart.dataValues.cs_pt_en_id));

                res.status(200)
                    .json({
                        status:'success',
                        message: 'ok',
                        data: {
                            product_id: dataCart.dataValues.cs_pt_id,
                            qty: dataCart.dataValues.cs_qty,
                            pi_id: dataCart.dataValues.cs_pi_id,
                            en_id: dataCart.dataValues.cs_pt_en_id,
                            data_inventory: dataInventory
                        },
                        error: null
                    })
            } catch (error) {
                res.status(400)
                    .json({
                        status: 'failed',
                        message: 'error',
                        data: null,
                        error: error.message
                    })
            }
    } 

    buyBack = async (req, res) => {
        try {
            let {data} = req.body;
            let {userid, usernama: username} = Auth.user();

            await CartService.bulkDeleteDataCart2(data[0]['pt_id'], Auth.user());

            for (const {invc_oid: inventoryOid, pt_id: productId, en_id: entityId, qty: quantity, pi_id: priceListId} of data) {
                let dataUser = {userid, username};
                    let bodyCart = {productId, entityId, inventoryOid, priceListId, quantity: parseInt(quantity)};

                    await Promise.all([
                        CartService.inputIntoCart(bodyCart, dataUser, 'N'),
                        InventoryService.bookProductQuantit2(inventoryOid, parseInt(quantity))
                    ])
            }

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: null,
                    error: null
                })
        } catch (error) {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    increaseQtyCart = async (dataCartSales, dataInventory, quantity, transaction) => {
        let resultQuantity = parseInt(quantity) - parseInt(dataCartSales.cs_qty)
        let qtyInventory = {
            quantityAvailable: Sequelize.literal(`CAST(invc_qty_available AS INTEGER) - ${parseInt(quantity)}`),
            quantityBooked: Sequelize.literal(`CAST(invc_qty_available AS INTEGER) + ${parseInt(quantity)}`)
        }

        await Promise.all([
            InventoryService.bookProductQuantity(dataInventory.invc_oid, qtyInventory, transaction),
            CartService.updateCart(dataCartSales.cs_oid, parseInt(quantity), transaction)
        ])

    }

    expireData = async (userId) => {
        let data = await CartService.retrieveDataCartThatShouldBeExpired(userId, 'N');

        if (data.length != 0) {
            await sequelize.transaction(async t => {
                for (const {dataValues: singularData} of data) {
                    let {dataValues: dataInventory} = await InventoryService.getDataInventory(singularData.cs_invc_oid, t);
    
                    await this.expireDataChart(singularData, dataInventory, t);
                }
            })
        }
    }

    expireDataChart = async (dataCartSales, dataInventory, transaction) => {
        let qtyInventory = {
            quantityAvailable: parseInt(dataInventory.qty_available) + parseInt(dataCartSales.cs_qty),
            quantityBooked: parseInt(dataInventory.qty_booked) - parseInt(dataCartSales.cs_qty)
        }

        await Promise.all([
            InventoryService.bookProductQuantity(dataCartSales.cs_invc_oid, qtyInventory, transaction),
            CartService.updateCart(dataCartSales.cs_oid, dataCartSales.cs_qty, 'E', transaction)
        ])
    }
}

module.exports = new SalesV2Controller();