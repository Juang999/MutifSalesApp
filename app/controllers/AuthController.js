const {Op} = require('sequelize');
const jwt = require('jsonwebtoken');
const Page = require('../../helper/Page');
const {errorResponse} = require('../../helper/Helper');
const {config} = require('../../config/environment');
const {getData} = require('../../helper/ProductUrl');
const {info, errorV2: errorLog} = require('../../helper/Logging');
const {
    Wishlist,
    ArMstr, ArdDist,
    Sequelize, ChartSales, 
    TConfUser, TokenStorage,
} = require('../../models');
const Auth = require('../../helper/Auth');
const moment = require('moment');
const {v4: uuidv4} = require('uuid');
const {UserService} = require('../services/ServiceContainer');

class AuthController {
    loginClient = async (req, res) => {
        try {
            let {username, password} = req.body
            
            let user = await UserService.findClientAccount(username, password);

            if (user == null) {
                res.status(400)
                    .json({
                        status: 'fales',
                        message: 'Unauthorized',
                        data: null,
                        error: null
                    })

                return;
            }

            let token = this.createToken(user.dataValues);
            await this.insertToken(user.dataValues.userid, token);

            info("LOGIN CLIENT", `${user.dataValues.usernama} LOGGED IN!`)
            res.status(200)
                .json({
                    status: 'success',
                    message: 'logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
            await errorLog("LOGIN CLIENT", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message:'error',
                    data: null,
                    error: errorResponse(error.message)
                })
        }
    }

    loginAdmin = async (req, res) => {
        try {
            let {username, password} = req.body;

            let admin = await UserService.findAdminAccount(username, password);

            if (admin == null) {
                res.status(400)
                    .json({
                        status: 'fales',
                        message: 'Unauthorized',
                        data: null,
                        error: null
                    })

                return;
            }

            let token = this.createToken(admin.dataValues)

            info("LOGIN ADMIN", `${admin.dataValues.usernama} LOGGED IN!`)

            res.status(200)
                .json({
                    status: 'success',
                    message: 'admin logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
            await errorLog("LOGIN ADMIN", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: errorResponse(error.message)
                })
        }
    }

    getProfile = async (req, res) => {
        try {
            let {userid} = Auth.user();

            let dataProfile = await UserService.retrieveDataProfile(userid);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'got profile!',
                    data: dataProfile,
                    error: null
                })
        } catch (error) {
            await errorLog("PROFILE USER", error.message);
    
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'failed to get profile!',
                    data: null,
                    error: errorResponse(error.message)
                })
        }
    }

    sumAccountReceivable = (req, res) => {
        let {user_ptnr_id} = Auth.user();

        UserService.sumAccountReceivable(user_ptnr_id)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(async err => {
            await errorLog('SUM ACCOUNT RECEIVABLE', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: errorResponse(err.message)
                })
        })
    }

    getAccountReceivable = (req, res) => {
        let {user_ptnr_id} = Auth.user();
        let currentPage = (req.query.page) ? parseInt(req.query.page) : 1;
        let {limit, offset} = new Page(currentPage, 20);
        let search = (req.query.search) ? `${req.query.search}` : '';

        UserService.getDataAccountReceivable(user_ptnr_id, search, limit, offset)
        .then(({count, rows}) => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        data: rows,
                        total_data: count,
                        current_page: currentPage,
                        last_page: Math.ceil(count / limit),
                        total_page: Math.ceil(count / limit)
                    },
                    error: null
                })
        })
        .catch(async err => {
            await errorLog('GET ACCOUNT RECEIVABLE', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: errorResponse(err.message)
                })
        })
    }

    getDetailAccountReceivable = (req, res) => {
        ArMstr.findOne({
            attributes: [
                ['ar_code', 'account_receivable_code'],
                ['ar_remarks', 'salesorder_code'],
                ['ar_date', 'date'],
                ['ar_eff_date', 'effective_date'],
                ['ar_status', 'status'],
                ['ar_amount', 'amount'],
                ['ar_pay_amount', 'paid']
            ],
            include: [
                {
                    model: ArdDist,
                    as: 'detail_account_receivable',
                    attributes: [
                        'ard_ac_id',
                        'ard_amount',
                        'ard_remarks'
                    ]
                }
            ],
            where: {
                ar_oid: req.params.arOid,
                ar_bill_to: Auth.user().user_ptnr_id
            },
            logging: false
        })
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(async err => {
            await errorLog('SUM ACCOUNT RECEIVABLE', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: errorResponse(err.message)
                })
        })
    }

    getLoggedinUser = (req, res) => {
        TokenStorage.scope('oneDayLoggedIn', 'mutifSalesAppDesc').findAll({
            attributes: [
                [Sequelize.col('user.userid'), 'userid'],
                [Sequelize.col('user.usernama'), 'user_name'],
                ['created_at', 'logged_in']
            ],
            include: [
                {
                    model: TConfUser,
                    as: 'user',
                    attributes: []
                }
            ],
            logging: false
        })
        .then(result => {
            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(async err => {
            await errorLog(`GET LOGGED IN USER`, err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: errorResponse(err.message)
                })
        })
    }

    createToken = (dataUser) => {
        return jwt.sign(dataUser, config.parsed.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
    }

    insertToken = async (userid, token) => {
        await TokenStorage.create({
            token_oid: uuidv4(),
            token_user_id: userid,
            token_token: token,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            token_desc: 'mutif-sales-app'
        }, {
            logging: false
        })
    }

    getImages = async (dataProduct) => {
        let result = [];

        for (const {dataValues} of dataProduct) {
            let image = await this.getImageProduct(dataValues.product_code)
            dataValues.photo = (image == '-') ? null : image;
            result.push(dataValues)
        }

        return result;
    }

    getImageProduct = async (productCode) => {
        let {data: getImage} = await getData(`/exapro/${productCode}/image`)

        return getImage;
    }
}

module.exports = new AuthController();