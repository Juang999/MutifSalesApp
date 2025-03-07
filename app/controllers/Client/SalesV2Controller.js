const axios = require('axios');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');
const {config} = require('../../../config/environment');
const {info, error: errorLog} = require('../../../helper/Logging');
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
            errorLog('GET DATA CART V2', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getLimitedCart = (req, res) => {
        let {userid} = Auth.user();

        Promise.all([CartService.getSubTotalPriceCart(userid), CartService.retrieveLimitedDataCart(userid)])
        .then(([subTotalPrice, dataCart]) => {

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
}

module.exports = new SalesV2Controller();