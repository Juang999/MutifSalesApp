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
    PtnrMstr, PtnrgGrp,
    Sequelize, ChartSales, 
    TConfUser, TokenStorage,
} = require('../../models');
const Auth = require('../../helper/Auth');
const moment = require('moment');
const {v4: uuidv4} = require('uuid');

class UserService {
    findClientAccount = async (username, password) => {
        let result = await TConfUser.findOne({
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
                usernama: username,
                password: password,
                user_ptnr_id: {
                    [Op.in]: Sequelize.literal("(SELECT ptnr_id FROM public.ptnr_mstr WHERE ptnr_is_emp = 'Y')")
                }
            },
            logging: false
        })

        return result;
    }

    findAdminAccount = async (username, password) => {
        let result = await TConfUser.findOne({
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
                usernama: username,
                password: password,
                groupid: 1
            },
            logging: false
        })

        return result;
    }

    retrieveDataProfile = async (userId) => {
        let result = await TConfUser.findOne({
                    attributes: [
                        [Sequelize.col(`"detail_partner"."ptnr_id"`), 'ptnr_id'],
                        [Sequelize.col('"detail_partner"."ptnr_name"'), 'ptnr_name'],
                        ['usernama', 'username'],
                        [Sequelize.col('"detail_partner"."ptnr_ptnrg_id"'), 'group_id'],
                        [Sequelize.col('"detail_partner->group_partner"."ptnrg_code"'), 'group_code'],
                        [Sequelize.col('"detail_partner->group_partner"."ptnrg_name"'), 'group_name'],
                        [Sequelize.literal(`CASE WHEN "detail_partner"."ptnr_ptnrg_id" = 9911 THEN '0.40' ELSE '0.30' END`), 'discount'],
                        [Sequelize.literal(`(SELECT COUNT(*) FROM public.chart_sales WHERE cs_userid = ${userId} AND cs_trans_id = 'D')`), 'products_in_chart'],
                        [Sequelize.literal(`(SELECT COUNT(wl_oid) FROM public.wishlists WHERE wl_user_id = ${userId} AND wl_is_po = FALSE)`), 'products_wishlist'],
                        [Sequelize.literal(`(SELECT COUNT(wl_oid) FROM public.wishlists WHERE wl_user_id = ${userId} AND wl_is_po = TRUE)`), 'products_pre_order'],
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
                        },
                    ],
                    where: {
                        userid: userId,
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

    getAccountReceivable = async (partnerId, search, limit, offset) => {
        let result = await ArMstr.findAndCountAll({
            attributes: [
                'ar_oid',
                ['ar_code', 'account_receivable_code'],
                ['ar_remarks', 'salesorder_code'],
                ['ar_amount', 'amount'],
                ['ar_date', 'date'],
                ['ar_pay_amount', 'paid']
            ],
            where: {
                ar_bill_to: partnerId,
                ar_remarks: {
                    [Op.iLike]: `%${search}%`
                }
            },
            order: [
                ['ar_date', 'DESC']
            ],
            limit,
            offset,
            logging: false,
        })

        return result;
    }
}

module.exports = new UserService();