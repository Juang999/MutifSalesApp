const {
    PtMstr,
    SoMstr, SodDet,
    Sequelize, sequelize,
    SoShipMstr, SoShipdDet
} = require('../../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const Auth = require('../../../helper/Auth');
const {insertQuery, insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');

class ShipmentController {
    index = (req, res) => {
        let search = (req.query.search) ? req.query.search : '';
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
                Sequelize.where(Sequelize.col(`soship_code`), {
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
                'soship_oid',
                ['soship_code', 'shipment_number'],
                [Sequelize.literal(`(SELECT so_code FROM public.so_mstr WHERE so_oid = (SELECT soship_so_oid FROM public.soship_mstr WHERE soship_oid = '${req.params.soship_oid}'))`), 'so_number'],
                ['soship_dt', 'date_shipment'],
                'soship_accepted',
                ['soship_remarks', 'remarks'],
                [Sequelize.literal(`(SELECT COUNT(soshipd_oid) FROM public.soshipd_det WHERE soshipd_soship_oid = '${req.params.soship_oid}')`), 'total_articles'],
                [Sequelize.literal(`(SELECT CAST(ABS(SUM(soshipd_qty_real)) AS INTEGER) FROM public.soshipd_det WHERE soshipd_soship_oid = '${req.params.soship_oid}')`), 'total_quantity'],
            ],
            include: [ 
                {
                    model: SoShipdDet,
                    as: 'singular_detail_shipment',
                    attributes: []
                }, {
                    model: SoShipdDet,
                    as: 'detail_shipment',
                    attributes: [
                        [Sequelize.literal(`"detail_shipment->detail_sales_order->product"."pt_desc1"`), 'product_name'],
                        [Sequelize.literal(`"detail_shipment->detail_sales_order->product"."pt_code"`), 'product_code'],
                        [Sequelize.literal(`CAST("detail_shipment->detail_sales_order"."sod_qty_shipment" AS INTEGER)`), 'ordered_qty'],
                        [Sequelize.literal('CAST(ABS("detail_shipment"."soshipd_qty_real") AS INTEGER)'), 'shiped_qty'],
                    ],
                    include: [
                        {
                            model: SodDet,
                            as: 'detail_sales_order',
                            attributes: [],
                            include: [
                                {
                                    model: PtMstr,
                                    as: 'product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ],
            where: [
                Sequelize.where(Sequelize.col('soship_oid'), {
                    [Op.eq]: req.params.soship_oid
                }),
                Sequelize.where(Sequelize.col(`soship_so_oid`), {
                    [Op.in]: Sequelize.literal(`(SELECT so_oid FROM public.so_mstr WHERE so_ptnr_id_bill = ${user_ptnr_id})`)
                })
            ],
            logging: false
            // group: ['shipment_number', 'so_number', 'date_shipment', 'soship_accepted', 'remarks']
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

    update = (req, res) => {
        const { user_ptnr_id } = Auth.user();

        SoShipMstr.update({
            soship_accepted: 'Y'
        }, {
            where: {
                soship_oid: req.params.soship_oid,
                soship_so_oid: {
                    [Op.in]: Sequelize.literal(`(SELECT so_oid FROM public.so_mstr WHERE so_ptnr_id_bill = ${user_ptnr_id})`)
                }
            },
            logging: async (query, {bind}) => {
                let result = query.split(': ');

                await insertQuery(result[1], bind)
            }
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