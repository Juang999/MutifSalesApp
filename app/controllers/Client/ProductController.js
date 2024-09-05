const {PtCatMstr, SoMstr, PidDet, PiddDet, SodDet, PtMstr, Sequelize} = require('../../../models');
const {info, error: errorLog} = require('../../../helper/Logging');
const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../../helper/Auth');

class ProductController {
    index = (req, res) => {

    }

    getCategories = (req, res) => {
        PtCatMstr.findAll({
            attributes: [
                ['ptcat_id', 'category_id'],
                ['ptcat_desc', 'category_desc']
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
            errorLog({feature: 'GET CATEGORY', message: err.message})

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getSuggest = async (req, res) => {
        try {
        const {ptnrg_id} = await Auth.user();
        let priceList = this.getPriceListUser(ptnrg_id);
        // let today = moment().format('YYYY-MM-DD');
        // let thirtyDayshBefore = moment().subtract(30, 'days').format('YYYY-MM-DD');
        let today = '2024-06-05'
        let thirtyDayshBefore = '2024-05-06'

        let result = await SodDet.findAll({
                attributes: [
                    [Sequelize.col('product.pt_desc1'), 'product_name'],
                    [Sequelize.literal('"product->master_category"."ptcat_desc"'), 'category_desc'],
                    [Sequelize.col('product.pt_code'), 'product_code'],
                    [Sequelize.literal('CAST(SUM(sod_qty_shipment) AS INTEGER)'), 'total_purchases'],
                    [Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"'), 'price'],
                    // [Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"'), 'discount'],
                ],
                include: [
                    {
                        model: PtMstr,
                        as: 'product',
                        attributes: [],
                        include: [
                            {
                                model: PtCatMstr,
                                as: 'master_category',
                                attributes: []
                            }, 
                            {
                                model: PidDet,
                                as: 'singular_relation_price_list',
                                attributes: [],
                                include: [
                                    {
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    }
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('sod_so_oid'), {
                            [Op.in]: Sequelize.literal(`(SELECT so_oid FROM public.so_mstr WHERE so_date BETWEEN '${thirtyDayshBefore}' AND '${today}')`)
                        }),
                        Sequelize.where(Sequelize.col('sod_qty_shipment'), {
                            [Op.not]: null
                        }),
                        Sequelize.where(Sequelize.literal('"product->master_category"."ptcat_id"'), {
                            [Op.not]: 12
                        }),
                        Sequelize.where(Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                            [Op.eq]: 9941
                        }),
                        Sequelize.where(Sequelize.literal('"product->singular_relation_price_list"."pid_pi_oid"'), {
                            [Op.in]: priceList
                        })
                    ]

                },
                group: [
                    Sequelize.col('product.pt_desc1'),
                    Sequelize.literal('"product->master_category"."ptcat_desc"'),
                    Sequelize.col('product.pt_code'),
                    Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_price"'),
                    // Sequelize.literal('"product->singular_relation_price_list->singular_detail_price_list"."pidd_disc"')
                ],
                order: [
                    ['total_purchases', 'desc']
                ],
                limit: 8
            })

            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
            
        }
    }

    getPriceListUser = (ptnrgId) => {
        let piOid;

        switch (ptnrgId) {
            case 9911:
                piOid = [
                    '80c389eb-dd3a-409c-81b3-c236e98f2c32',
                    '83415091-54cc-4fd1-8e10-0dac3561fb9c',
                    '75606dee-e498-4a5e-9858-568dfb1fb117'
                ]
                break;
            case 357:
                piOid = [
                    '6ed8e85a-aabd-4b53-b4a7-9e6878534b5c',
                    '71aac24e-246e-4837-98de-0f18f4783bf5',
                    'f71dab8c-7f65-4665-9ca3-1b7abd07312c'
                ]
                break;
            default:
                piOid = [
                    '6ed8e85a-aabd-4b53-b4a7-9e6878534b5c',
                    '71aac24e-246e-4837-98de-0f18f4783bf5',
                    'f71dab8c-7f65-4665-9ca3-1b7abd07312c'
                ]
                break;
        }

        return piOid;
    }
}

module.exports = new ProductController();