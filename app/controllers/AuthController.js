const {Op} = require('sequelize');
const jwt = require('jsonwebtoken');
const {config} = require('../../config/environment');
const {getData} = require('../../helper/ProductUrl');
const {info, error: errorLog} = require('../../helper/Logging')
const {
    ArMstr, ArdDist,
    PtnrMstr, PtnrgGrp,
    Sequelize, ChartSales, 
    TConfUser, TokenStorage,
} = require('../../models');
const Auth = require('../../helper/Auth');

class AuthController {
    loginClient = async (req, res) => {
        try {
            let user = await TConfUser.findOne({
                attributes: [
                    'userid',
                    'usernama',
                    'password',
                    'groupid',
                    'user_ptnr_id',
                    [Sequelize.literal(`"detail_partner"."ptnr_ptnrg_id"`), 'ptnrg_id']
                ],
                include: [
                    {
                        model: PtnrMstr,
                        as: 'detail_partner',
                        attributes: []
                    }
                ],
                where: {
                    usernama: req.body.username,
                    password: req.body.password,
                    user_ptnr_id: {
                        [Op.in]: Sequelize.literal("(SELECT ptnr_id FROM public.ptnr_mstr WHERE ptnr_is_emp = 'Y')")
                    }
                },
                logging: false
            })

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

            let token = await this.createToken(user.dataValues);

            info("LOGIN CLIENT", `${user.dataValues.usernama} LOGGED IN!`)
            res.status(200)
                .json({
                    status: 'success',
                    message: 'logged in!',
                    data: token,
                    error: null
                })
        } catch (error) {
            errorLog("LOGIN CLIENT", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message:'error',
                    data: null,
                    error: 'Internal Server Error'
                })
        }
    }

    loginAdmin = async (req, res) => {
        try {
            let admin = await TConfUser.findOne({
                attributes: [
                    'userid',
                    'usernama',
                    'password',
                    'groupid',
                    'user_ptnr_id',
                    [Sequelize.literal(`"detail_partner"."ptnr_ptnrg_id"`), 'ptnrg_id']
                ],
                include: [
                    {
                        model: PtnrMstr,
                        as: 'detail_partner',
                        attributes: []
                    }
                ],
                where: {
                    usernama: req.body.username,
                    password: req.body.password,
                    groupid: 1
                },
                logging: () => {}
            })

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
            errorLog("LOGIN ADMIN", error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message

                })
        }
    }

    getProfile = async (req, res) => {
        try {
            let {userid} = Auth.user();

            let dataProfile = await TConfUser.findOne({
                attributes: [
                    [Sequelize.col(`"detail_partner"."ptnr_id"`), 'ptnr_id'],
                    [Sequelize.col('"detail_partner"."ptnr_name"'), 'ptnr_name'],
                    ['usernama', 'username'],
                    [Sequelize.col('"detail_partner"."ptnr_ptnrg_id"'), 'group_id'],
                    [Sequelize.col('"detail_partner->group_partner"."ptnrg_code"'), 'group_code'],
                    [Sequelize.col('"detail_partner->group_partner"."ptnrg_name"'), 'group_name'],
                    [Sequelize.literal(`CASE WHEN "detail_partner"."ptnr_ptnrg_id" = 9911 THEN '0.40' ELSE '0.30' END`), 'discount'],
                    [Sequelize.literal(`COUNT(singular_chart_sales.cs_oid)`), 'products_in_chart'],
                ],
                include: [
                    {
                        model: PtnrMstr,
                        as: 'detail_partner',
                        attributes: [],
                        include: [
                            {
                                model: PtnrgGrp,
                                as: 'group_partner',
                                attributes: []
                            }
                        ]
                    }, {
                        model: ChartSales,
                        as: 'singular_chart_sales',
                        attributes: []
                    }
                ],
                where: {
                    userid
                },
                group: [
                    'ptnr_id',
                    'ptnr_name',
                    'usernama',
                    'group_id',
                    'group_code',
                    'group_name',
                    'discount'
                ],
                logging: false
            });

            res.status(200)
                .json({
                    status: 'success',
                    message: 'got profile!',
                    data: dataProfile,
                    error: null
                })
        } catch (error) {
            errorLog({feature: "PROFILE USER", message: error.message})
    
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'failed to get profile!',
                    data: null,
                    error: error.message
                })
        }
    }

    getDataAccountReceivable = (req, res) => {
        let {user_ptnr_id} = Auth.user();

        Promise.all([this.getAccountReceivable(user_ptnr_id), this.sumAccountReceivable(user_ptnr_id)])
        .then(([dataAr, totalAr]) => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        data: dataAr,
                        ar_total: totalAr.dataValues.ar_total
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

    getAccountReceivable = async (partnerId) => {
        let result = await ArMstr.findAll({
                attributes: [
                    'ar_oid',
                    ['ar_code', 'account_receivable_code'],
                    ['ar_remarks', 'salesorder_code'],
                    ['ar_amount', 'amount'],
                    ['ar_pay_amount', 'paid']
                ],
                where: {
                    ar_bill_to: partnerId
                },
                logging: false
            })

        return result;
    }

    sumAccountReceivable = async (partnerId) => {
        let result = await ArMstr.findOne({
                attributes: [
                    [Sequelize.literal(`CAST(SUM("ar_amount" - "ar_pay_amount") AS BIGINT)`), 'ar_total']
                ],
                where: {
                    ar_bill_to: partnerId
                },
                logging: false
            })

        return result;
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

    createToken = (dataUser) => {
        return jwt.sign(dataUser, config.parsed.ACCESS_TOKEN_SECRET, {expiresIn: '24h'})
    }

    inputToken = async (userid, token) => {
        await TokenStorage.create({
            token_user_id: userid,
            token_token: token,
            token_desc: 'mutif-sales-app'
        }, {
            logging: () => {}
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