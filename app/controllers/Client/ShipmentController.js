const {
    SoMstr, SodDet,
    Sequelize, sequelize,
    SoShipMstr, SoShipdDet
} = require('../../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const Auth = require('../../../helper/Auth');

class ShipmentController {
    index = (req, res) => {
        let search = (req.query.shipment_code) ? req.query.shipment_code : '';
        let startDate = (req.query.start_date) ? moment(req.query.start_date).format('YYYY-MM-DD') : moment().startOf('months').format('YYYY-MM-DD');
        let endDate = (req.query.end_date) ? moment(req.query.end_date).format('YYYY-MM-DD') : moment().endOf('months').format('YYYY-MM-DD');
        const { user_ptnr_id } = Auth.user();

        SoShipMstr.findAll({
            attributes: [
                'soship_oid',
                ['soship_code', 'shipment_number'],
                [Sequelize.col(`"master_sales_order"."so_code"`), 'so_number'],
                ['soship_dt', 'shipment_date'],
                'soship_is_shipment',
                'soship_accepted',
                [Sequelize.literal('COUNT("singular_detail_shipment"."soshipd_oid")'), 'total_articles']
            ],
            include: [
                {
                    model: SoShipdDet,
                    as: 'singular_detail_shipment',
                    attributes: []
                }, {
                    model: SoMstr,
                    as: 'master_sales_order',
                    attributes: []
                }
            ],
            where: [
                Sequelize.where(Sequelize.col(`"master_sales_order"."so_ptnr_id_bill"`), {
                    [Op.eq]: user_ptnr_id
                }),
                Sequelize.where(Sequelize.col(`"master_sales_order"."so_code"`), {
                    [Op.iLike]: `%${search}%`
                }),
                Sequelize.where(Sequelize.col('soship_date'), {
                    [Op.between]: [startDate, endDate]
                })
            ],
            group: ['so_number', 'shipment_number', 'shipment_date', 'soship_is_shipment', 'soship_accepted', 'soship_oid'],
            order: [['soship_dt', 'DESC']],
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
        .catch(err => [
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        ])
    }

    show = (req, res) => {
        let { user_ptnr_id } = Auth.user();

        SoShipMstr.findOne({
            attributes: [
                ['soship_code', 'shipment_number'],
                [Sequelize.literal(`(SELECT so_code FROM public.so_mstr WHERE so_oid = (SELECT soship_so_oid FROM public.soship_mstr WHERE soship_oid = '${req.params.soship_oid}'))`), 'so_number'],
                ['soship_remarks', 'remarks']
            ],
            include: [ 
                {
                    model: SoShipdDet,
                    as: 'detail_shipment',
                    attributes: [
                        'soshipd_oid'
                    ],
                }
            ],
            where: [
                Sequelize.where(Sequelize.col('soship_oid'), {
                    [Op.eq]: req.params.soship_oid
                }),
                Sequelize.where(Sequelize.col(`soship_so_oid`), {
                    [Op.in]: Sequelize.literal(`(SELECT so_oid FROM public.so_mstr WHERE so_ptnr_id_bill = ${user_ptnr_id})`)
                })
            ]
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
}

module.exports = new ShipmentController();