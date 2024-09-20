const {
    RegKelMstr,
    SqMstr, SqdDet, 
    PtMstr, Sequelize, 
    PtnrMstr, PtnraAddr, 
    sequelize, TConfUser, 
    PtnracCntc, RegCityMstr, 
    RegPropMstr, RegKecMstr,
    PiMstr, PidDet, PiddDet,
} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');

class OrderController {
    invoiceNumberSequence = (req, res) => {
        let startDay = moment().format('YYYY-MM-DD 00:00:00');
        let endDay = moment().format('YYYY-MM-DD 23:59:59');

        SqMstr.findAll({
            attributes: [
                [Sequelize.literal(`COUNT(DISTINCT(sq_midtrans_inv_number)) + 1`), 'invoice_number']
            ],
            where: {
                sq_add_date: {
                    [Op.between]: [startDay, endDay]
                }
            },
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

    getDetailInvoiceNumber = (req, res) => {
        let {userid, usernama, ptnrg_id, user_ptnr_id} = Auth.user();

        PtnrMstr.findOne({
            attributes: [
                [Sequelize.col('"detail_partner"."ptnr_id"'), 'ptnr_id'],
                [Sequelize.literal('"detail_partner"."ptnr_name"'), 'ptnr_name'],
                [Sequelize.literal(`CONCAT("detail_partner->singular_partner_address"."ptnra_line_3", ', ', "detail_partner->singular_partner_address"."ptnra_line_2", ', ', "detail_partner->singular_partner_address"."ptnra_line_1")`), 'ptnr_address'],
                [Sequelize.literal(`"detail_partner->singular_partner_address->singular_contact_address"."ptnrac_phone_1"`), 'phone'],
                [Sequelize.literal(`"detail_partner->singular_partner_address->singular_contact_address"."ptnrac_email"`), 'email'],
                [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_prov_id"'), 'prop_id'],
                [Sequelize.col('"detail_partner->singular_partner_address->singular_province"."prop_name"'), 'prop_name'],
                [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_city_id"'), 'kota_id'],
                [Sequelize.col(`"detail_partner->singular_partner_address->singular_city"."kota_name"`), 'kota_name'],
                [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_kec_id"'), 'kec_id'],
                [Sequelize.col(`"detail_partner->singular_partner_address->singular_kecamatan"."kec_name"`), 'kec_name'],
                [Sequelize.col('"detail_partner->singular_partner_address"."ptnra_kel_id"'), 'kel_id'],
                [Sequelize.col(`"detail_partner->singular_partner_address->singular_kelurahan"."kel_name"`), 'kel_name']
            ],
            include: [
                {
                    model: TConfUser,
                    as: 'detail_partner',
                    attributes: [],
                    include: [
                        {
                            model: PtnraAddr,
                            as: 'singular_partner_address',
                            attributes: [],
                            include: [
                                {
                                    model: PtnracCntc,
                                    as: 'singular_contact_address',
                                    attributes: []
                                }, {
                                    model: RegPropMstr,
                                    as: 'singular_province',
                                    attributes: []
                                }, {
                                    model: RegCityMstr,
                                    as: 'singular_city',
                                    attributes: []
                                }, {
                                    model: RegKecMstr,
                                    as: 'singular_kecamatan',
                                    attributes: []
                                }, {
                                    model: RegKelMstr,
                                    as: 'singular_kelurahan',
                                    attributes: []
                                }
                            ]
                        }, 
                    ]
                }
            ],
            where: {
                ptnr_id: {
                    [Op.eq]: Sequelize.literal('')
                }
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

    getInvoiceNumber = (req, res) => {
        let startDate = (req.query.start_date) ? moment(req.query.start_date).format('YYYY-MM-DD HH:mm:ss') : moment().startOf('months').format('YYYY-MM-DD HH:mm:ss')
        let endDate = (req.query.end_date) ? moment(req.query.end_date).format('YYYY-MM-DD HH:mm:ss') : moment().endOf('months').format('YYYY-MM-DD HH:mm:ss')

        SqMstr.findAll({
            attributes: [
                ['sq_midtrans_inv_number', 'invoice'],
                ['sq_midtrans_inv_status', 'status'],
                [Sequelize.literal('CAST(SUM(sq_total) AS INTEGER)'), 'total_puchase'],
            ],
            where: {
                sq_add_date: {
                    [Op.between]: [startDate, endDate]
                },
                sq_ptnr_id_sold: Auth.user().user_ptnr_id
            },
            group: [
                'sq_midtrans_inv_number',
                'sq_midtrans_inv_status',
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

    getDetailUser = async (userId) => {
        

        return dataUser;
    }

    getOrderedItem = async (invoiceNumber) => {
        try {
            
            let dataItem = await SqdDet.findAll({
                attributes: [
                    [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                    [Sequelize.col('"product"."pt_code"'), 'product_code'],
                    ['sqd_qty', 'quantity_ordered'],
                    [Sequelize.col(`"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"`), "price"],
                    [Sequelize.col(`"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`), "discount"],
                ],
                include: [
                    {
                        model: PtMstr,
                        as: 'product',
                        attributes: [],
                        include: [
                            {
                                model: PidDet,
                                as: 'singular_relation_price_list',
                                attributes: [],
                                include: [
                                    {
                                        model: PiMstr,
                                        as:'master_price_list',
                                        attributes: [],
                                        where: {
                                            pi_id: {
                                                [Op.in]: (Auth.user().ptnrg_id == 9911) ? [103, 202, 304] : [991, 203, 302]
                                            }
                                        }
                                    }, {
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: [],
                                        where: {
                                            pidd_payment_type: 9941
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: {
                    sqd_sq_oid: {
                        [Op.in]: Sequelize.literal(`(SELECT sq_oid FROM public.sq_mstr WHERE sq_midtrans_inv_number = '${invoiceNumber}')`)
                    }
                }
            })
    
            return dataItem;
        } catch (error) {
            return error.message
        }
    }
}

module.exports = new OrderController();