const {ChartSales, PiMstr, PiddDet, InvcMstr, PtMstr, PidDet, Sequelize} = require('../../../models');
const Auth = require('../../../helper/Auth');
const moment = require('moment');
const {info, error: errorLog} = require('../../../helper/Logging');
const {Op} = require('sequelize');
const {getData} = require('../../../helper/ProductUrl');

class SalesController {
    inputIntoChart = async (req, res) => {
        try {
            let {userid} = Auth.user();

            let result = await ChartSales.create({
                cs_userid: userid,
                cs_pt_id: req.body.pt_id,
                cs_pt_en_id: req.body.en_id,
                cs_invc_oid: req.body.invc_oid,
                cs_qty: req.body.qty,
                cs_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                cs_pi_id: req.body.pi_id
            }, {
                individualHooks: true,
                logging: false
            })

            res.status(200)
                .json({
                    status: 'success',
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

    getDataChart = async (req, res) => {
        try {
            let {userid} = Auth.user();

            let dataChart = await ChartSales.findAll({
                attributes: [
                    'cs_oid',
                    [Sequelize.col('product.pt_desc1'), 'product_name'],
                    [Sequelize.col('product.pt_code'), 'product_code'],
                    [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'chart_quantity'],
                    [Sequelize.literal('CAST("qty_location"."invc_qty_available" AS INTEGER)'), 'available_quantity'],
                    [Sequelize.literal(`CASE WHEN "qty_location"."invc_qty_available" - cs_qty < 0 THEN 'pemesanan melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                    [Sequelize.literal('CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                    [Sequelize.literal('CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc" AS INTEGER)'), 'discount']
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
                                        as: 'master_price_list',
                                        attributes: []
                                    }, {
                                        model: PiddDet,
                                        as: 'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: InvcMstr,
                        as: 'qty_location',
                        attributes: []
                    }
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('cs_userid'), {
                            [Op.eq]: userid
                        }),
                        Sequelize.where(Sequelize.col('"product->singular_relation_price_list->master_price_list"."pi_id"'), {
                            [Op.eq]: Sequelize.col('"cs_pi_id"')
                        }),
                        Sequelize.where(Sequelize.col('"product->singular_relation_price_list->singular_detail_price_list"."pidd_payment_type"'), {
                            [Op.eq]: 9941
                        })
                    ]
                },
                logging: false
            })

            if (dataChart == null) {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'ok',
                        data: [],
                        error: null
                    })
            }

            let result = await this.getImages(dataChart);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            errorLog('CHART', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    getImages = async (dataProduct) => {
        let result = [];

        for (const {dataValues} of dataProduct) {
            dataValues.photo = await this.getImageProduct(dataValues.product_code)

            result.push(dataValues)
        }

        return result;
    }

    getImageProduct = async (productCode) => {
        let {data: getImage} = await getData(`/exapro/${productCode}/image`)

        return getImage;
    }
}

module.exports = new SalesController();