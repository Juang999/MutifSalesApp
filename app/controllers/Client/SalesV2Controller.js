const axios = require('axios');
const {Op} = require('sequelize');
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

            await this.expireData(userid);

            let result = await CartService.retrieveDataCart(userid, 'D', 'N')
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

    expireData = async (userId) => {
        let data = await CartService.retrieveDataCartThatShouldBeExpired(userId, 'N');

        await sequelize.transaction(async t => {
            for (const {dataValues: singularData} of data) {
                let {dataValues: dataInventory} = await InventoryService.getDataInventory(singularData.cs_invc_oid, t);

                await this.expireDataChart(singularData, dataInventory, t);
            }
        })
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