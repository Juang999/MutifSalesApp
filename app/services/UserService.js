const {
    Wishlist,
    ArMstr, ArdDist,
    PtnrMstr, PtnrgGrp,
    Sequelize, ChartSales, 
    TConfUser, TokenStorage,
} = require('../../models');
const moment = require('moment');
const {Op} = require('sequelize');
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
                [Sequelize.literal(`"detail_partner"."ptnr_ptnrg_id"`), 'ptnrg_id'],
                'user_flashsale'
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
                [Op.and]: [
                    Sequelize.where(Sequelize.literal(`"detail_partner"."ptnr_is_emp"`), {
                        [Op.eq]: 'Y'
                    })
                ]
            }
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
                        // [Sequelize.literal(`CASE WHEN COUNT(DISTINCT("singular_chart_sales"."cs_pt_id")) IS NULL THEN 0 ELSE COUNT("singular_chart_sales"."cs_userid") END`), 'products_in_chart'],
                        [Sequelize.literal(`(SELECT COUNT(DISTINCT(cs_pt_id)) FROM public.chart_sales WHERE cs_userid = userid AND cs_trans_id = 'D' AND cs_preorder = 'N')`), 'products_in_chart'],
                        [Sequelize.literal(`CASE WHEN COUNT("singular_wishlist"."wl_user_id") IS NULL THEN 0 ELSE COUNT("singular_wishlist"."wl_user_id") END`), 'products_wishlist'],
                        [Sequelize.literal(`CASE WHEN COUNT("singular_pre_order"."wl_user_id") IS NULL THEN 0 ELSE COUNT("singular_pre_order"."wl_user_id") END`), 'products_pre_order'],
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
                            model: ChartSales.scope('defaultTransId', 'isReguler'),
                            required: false,
                            as: 'singular_chart_sales',
                            attributes: []
                        }, {
                            model: Wishlist.scope('isWishlist'),
                            required: false,
                            as: 'singular_wishlist',
                            attributes: []
                        }, {
                            model: Wishlist.scope('isPreOrder'),
                            required: false,
                            as: 'singular_pre_order',
                            attributes: []
                        }
                    ],
                    where: {
                        userid: userId,
                    },
                    group: [
                        'userid',
                        'ptnr_id',
                        'ptnr_name',
                        'usernama',
                        'group_id',
                        'group_code',
                        'group_name',
                        'discount'
                    ],
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
            offset
        })

        return result;
    }

    insertToken = async (userId, token) => {
        await TokenStorage.create({
            token_oid: uuidv4(),
            token_user_id: userId,
            token_token: token,
            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            token_desc: 'mutif-sales-app'
        })
    }
}

module.exports = new UserService();