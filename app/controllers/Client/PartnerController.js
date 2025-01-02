const {PtnrMstr, PtnrgGrp, PtnraAddr, SqMstr, EnMstr, SoMstr, Sequelize} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');

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
                [Sequelize.literal(`(SELECT CONCAT(ptnra_line_1, ' ', ptnra_line_2, ' ', ptnra_line_3) FROM public.ptnra_addr WHERE ptnra_ptnr_oid = ptnr_oid LIMIT 1)`), 'address']
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
            }
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
}

module.exports = new PartnerController();