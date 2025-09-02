const {
    PtnrMstr, CashiIn, 
    PtnrgGrp, PtnraAddr, 
    PtMstr, SqMstr, 
    EnMstr, SoMstr, 
    SodDet, Sequelize
} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');
const {PartnerService} = require('../../services/ServiceContainer');

class PartnerController {
    getDistributor = (req, res) => {
        PtnrMstr.findAll({
            attributes: [
                ['ptnr_id', 'id'],
                ['ptnr_code', 'partner_code'],
                ['ptnr_name', 'distributor_name'],
            ],
            where: {
                ptnr_ptnrg_id: 9911,
                ptnr_en_id: 1
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

    getDistributorPartner = (req, res) => {
        let ptnrId = req.params.ptnr_id;
        let searcName = (req.query.search) ? req.query.search : '';

        this.queryDistributorPartner(ptnrId, searcName)
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

    getOrderPartner = (req, res) => {
        let startDate = (req.query.start_date) ? moment(req.query.start_date).format('YYYY-MM-DD 00:00:00') : moment().startOf('months').format('YYYY-MM-DD 00:00:00');
        let endDate = (req.query.end_date) ? moment(req.query.end_date).format('YYYY-MM-DD 23:59:59') : moment().endOf('months').format('YYYY-MM-DD 23:59:59');

        PtnrMstr.findOne({
            attributes: [
                'ptnr_id',
                'ptnr_name',
                'ptnr_code',
                [Sequelize.literal(`(SELECT CONCAT(ptnra_line_1, ' ', ptnra_line_2, ' ', ptnra_line_3) FROM public.ptnra_addr WHERE ptnra_ptnr_oid = ptnr_oid LIMIT 1)`), 'address'],
                [Sequelize.literal(`(SELECT ptnra_phone_1 FROM public.ptnra_addr WHERE ptnra_ptnr_oid = ptnr_oid LIMIT 1)`), 'phone_number_1'],
                [Sequelize.literal(`(SELECT ptnra_phone_2 FROM public.ptnra_addr WHERE ptnra_ptnr_oid = ptnr_oid LIMIT 1)`), 'phone_number_2'],
                [Sequelize.literal(`(SELECT ptnrac_email FROM public.ptnrac_cntc WHERE addrc_ptnra_oid = (SELECT ptnra_oid FROM public.ptnra_addr WHERE ptnra_ptnr_oid = ptnr_oid LIMIT 1) LIMIT 1)`), 'email'],
                [Sequelize.literal(`(SELECT ptnrg_name FROM public.ptnrg_grp WHERE ptnrg_id = ptnr_ptnrg_id LIMIT 1)`), 'group name'],
            ],
            include: [
                {
                    model: SoMstr,
                    as: 'sales_order',
                    required: false,
                    attributes: [
                        'so_oid',
                        'so_code',
                        'so_date',
                        ['so_trans_id', 'transaction_status'],
                        [Sequelize.literal('"sales_order->entity_so"."en_desc"'), 'entity'],
                        [Sequelize.literal('"sales_order->sales_person"."ptnr_name"'), 'sales'],
                        [Sequelize.literal('CAST(so_total AS BIGINT)'), 'so_total']
                    ],
                    include: [
                        {
                            model: PtnrMstr,
                            as: 'sales_person',
                            attributes: [],
                        }, {
                            model: EnMstr,
                            as: 'entity_so',
                            attributes: []
                        }
                    ],
                    where: {
                        so_add_date: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                }
            ],
            where: {
                ptnr_id: req.params.ptnr_id
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

    getDetailSalesOrder = (req, res) => {
        SoMstr.findOne({
            attributes: [
                'so_oid',
                'so_code',
                ['so_sq_ref_code', 'sq_code'],
                ['so_date', 'effective_date'],
                ['so_payment_date', 'payment_date'],
                [Sequelize.literal(`(SELECT ptnr_name FROM public.ptnr_mstr WHERE ptnr_id = so_sales_person LIMIT 1)`), 'sales'],
                [Sequelize.literal('CAST(so_total AS BIGINT)'), 'total'],
                ['so_trans_id', 'transaction_status'],
                'so_terbilang'
            ],
            include: [
                {
                    model: SodDet,
                    as: 'detail_sales_order',
                    attributes: [
                        'sod_pt_id',
                        [Sequelize.literal('"detail_sales_order->product"."pt_desc1"'), 'product_name'],
                        [Sequelize.literal(`"detail_sales_order->product->entity_product"."en_desc"`), 'entity'],
                        [Sequelize.literal('CAST(sod_qty AS INTEGER)'), 'quantity'],
                        [Sequelize.literal('CAST(sod_price AS BIGINT)'), 'price'],
                        [Sequelize.literal('ROUND(sod_disc, 2)'), 'discount']
                    ],
                    include: [
                        {
                            model: PtMstr,
                            as: 'product',
                            attributes: [],
                            include: [
                                {
                                    model: EnMstr,
                                    as: 'entity_product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ]
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

    getLimitAndDeposit = (req, res) => {
        CashiIn.findOne({
            attributes: [
                [Sequelize.col('"detail_partner"."ptnr_limit_credit"'), 'credit_limit'],
                [Sequelize.literal(`CAST(SUM(cashi_amount) AS BIGINT)`), 'deposit']
            ],
            include: [
                {
                    model: PtnrMstr,
                    as: 'detail_partner',
                    attributes: [],
                }
            ],
            where: [
                Sequelize.where(Sequelize.col(`"detail_partner"."ptnr_id"`), {
                    [Op.eq]: Auth.user().user_ptnr_id
                }),
                Sequelize.where(Sequelize.col(`"cashi_is_depo"`), {
                    [Op.eq]: 'Y'
                })
            ],
            group: [
                Sequelize.col('"detail_partner"."ptnr_limit_credit"'),
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

    queryDistributorPartner = async (ptnr_id, searchName) => {
        let data = await PtnrMstr.findAll({
                attributes: [
                    ['ptnr_id', 'id'],
                    ['ptnr_code', 'partner_code'],
                    ['ptnr_name', 'partner_name'],
                    [Sequelize.col('group_partner.ptnrg_desc'), 'partner_section'],
                    [Sequelize.literal(`COUNT("sales_order"."so_oid")`), 'total_so']
                ],
                include: [
                    {
                        model: PtnrgGrp,
                        as: 'group_partner',
                        attributes: []
                    }, {
                        model: SoMstr.scope('oneMonth'),
                        as: 'sales_order',
                        required: false,
                        attributes: [],
                    }
                ],
                where: {
                    ptnr_en_id: 1,
                    ptnr_parent: {
                        [Op.in]: Sequelize.literal(`(SELECT dbgd_ptnr_id FROM public.dbgd_det WHERE dbgd_dbg_oid = (SELECT dbgd_dbg_oid FROM public.dbgd_det WHERE dbgd_ptnr_id = ${ptnr_id}))`)
                    },
                    ptnr_ptnrg_id: {
                        [Op.notIn]: [999, 9911, 9916, 9910, 9913]
                    },
                    ptnr_name: {
                        [Op.iLike]: `%${searchName}%`
                    }
                },
                group: [
                    'id',
                    'ptnr_oid',
                    'partner_code',
                    'partner_name',
                    'partner_section',
                ],
                logging: false
            })

        return data;
    }

    getDataPartner = (req, res) => {
        let search = req.query.search_name || '';

        PartnerService.getDataPartnerByEntity(req.params.entity_id, search)
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

    getDataSales = (req, res) => {
        PartnerService.getDataSalesByEntity(req.params.entity_id)
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

module.exports = new PartnerController();