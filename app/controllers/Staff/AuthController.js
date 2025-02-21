const {Op} = require('sequelize');
const jwt = require('jsonwebtoken');
const Page = require('../../../helper/Page');
const {config} = require('../../../config/environment');
const {getData} = require('../../../helper/ProductUrl');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    ArMstr, ArdDist,
    Wishlist, EnMstr,
    PtnrMstr, PtnrgGrp,
    Sequelize, ChartSales, 
    TConfUser, TokenStorage,
} = require('../../../models');
const Auth = require('../../../helper/Auth');
const moment = require('moment');
const {v4: uuidv4} = require('uuid');

class AuthController {
    getUser = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';

        TConfUser.findAll({
            attributes: [
                ['userid', 'user_id'],
                ['usernama', 'username'],
                'userpidgin',
                ['user_ptnr_id', 'sales_id'],
                ['usernik', 'nik'],
                ['useremail', 'email'],
                ['useractive', 'is_active'],
                'last_access',
                ['userphone', 'phone'],
                [Sequelize.col(`"entity_default"."en_desc"`), 'entity'],
                [Sequelize.col(`"detail_partner"."ptnr_name"`), 'partner_name'],
                [Sequelize.col(`"detail_partner->group_partner"."ptnrg_desc"`), 'partner_group'],
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
                    model: EnMstr,
                    as: 'entity_default',
                    attributes: []
                }
            ],
            where: [
                Sequelize.where(Sequelize.col("usernama"), {
                    [Op.like]: `%${search}%`
                })
            ]
        })
        .then(result => {
            res.status(200)
                .json({
                    status: 'succcessful',
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

    updatePartnerUser = (req, res) => {
        TConfUser.update({
            user_ptnr_id: req.body.ptnr_id,
        }, {
            where: {
                userid: req.params.userid
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
}

module.exports = new AuthController();