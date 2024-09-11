const {ChartSales, PiMstr, PiddDet, InvcMstr, PtMstr, PidDet, Sequelize, SogGenPtnrMstr} = require('../../../models');
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
            errorLog('STORE CHART', error.message)

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
                    [Sequelize.literal('ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                    ['cs_created_at', 'created_at'],
                    ['cs_updated_at', 'updated_at'],
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
                order: [
                    ['cs_updated_at', 'desc']
                ],
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
            errorLog('GET CHART', error.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    updateChart = async (req, res) => {
        try {
            if (req.body.cs_qty == 0) {
                await this.deleteDataChart(Auth.user().userid, req.params.cs_oid)
            } else {
                await this.updateDataChart(req.body.cs_qty, Auth.user().userid, req.params.cs_oid)
            }

            res.status(200)
                    .json({
                        status:'success',
                        message: 'updated!',
                        data: null,
                        error: null
                    })
        } catch (error) {
            errorLog('UPDATE CHART', error.message)

                res.status(200)
                    .json({
                        status: 'failed',
                        message: 'error',
                        data: null,
                        error: error.message
                    })
        }
    }

    deleteChart = (req, res) => {
        this.deleteDataChart(Auth.user().userid, req.params.cs_oid)
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'deleted!',
                    data: null,
                    error: null
                })
        })
        .catch(err => {
            errorLog('DELETE CHART', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    checkOut = async (req, res) => {
        try {
            let dataPartner = await this.getPartner(Auth.user().user_ptnr_id);


        } catch (error) {
            
        }
    }

    updateDataChart = async (qty, userid, csOid) => {
        await ChartSales.update({
            cs_qty: qty,
            cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: {
                cs_oid: csOid,
                cs_userid: userid
            },
            logging: false,
            individualHooks: true
        })
    } 

    deleteDataChart = async (userid, csOid) => {
        await ChartSales.destroy({
            where: {
                cs_oid: csOid,
                cs_userid: userid
            },
            logging: false,
            individualHooks: true
        })
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

    getPartner = async (userPtnrId) => {
        let result = await SogGenPtnrMstr.findOne({
            attributes: [
                'sog_gen_emp_mstr_id',
                'sog_gen_emp_mstr_en_id',
                'sog_gen_emp_mstr_code',
                'sog_gen_emp_mstr_name',
                'sog_gen_emp_mstr_addr',
                'sog_gen_emp_mstr_jbl_id',
                'sog_gen_emp_mstr_is_emp',
            ],
            where: {
                sog_gen_emp_mstr_id: userPtnrId,
            }
        })

        return result;
    }
}

module.exports = new SalesController();