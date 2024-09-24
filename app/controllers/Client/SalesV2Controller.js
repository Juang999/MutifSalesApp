const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {getData} = require('../../../helper/ProductUrl');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    SqdDet,
    ChartSales, PiMstr,
    PtnrMstr, InvcMstr,
    PiddDet, TConfUser,
    PtnraAddr, PtnracCntc, 
    RegKecMstr, RegKelMstr,
    LocMstr, SogGenPtnrMstr,
    RegPropMstr, RegCityMstr,
    PtMstr, PidDet, Sequelize, 
    SqMstr, sequelize, InvctTable,
    ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');
const Bilangan = require('../../../helper/Bilangan');
const {insertQuery, insertBulkQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {getData: urlGetData, patchData: urlPatchData, putData: urlPutData} = require('../../../helper/ProductStock');

class SalesV2Controller {
    getChart = async (req, res) => {
        try {
            let {userid} = Auth.user();

            let dataChart = await this.getDataChart(userid)

            if (dataChart == null) {
                res.status(200)
                    .json({
                        status: 'success',
                        message: 'ok',
                        data: [],
                        error: null
                    })

                return;
            }

            let result = await this.getDetailProductChart(dataChart);

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

    getDetailProductChart = async (dataProducts) => {
        let result = [];
        
        for (const {dataValues} of dataProducts) {
            let [detailStockProduct, imageProduct] = await Promise.all([this.getDetailStockProduct(dataValues.product_code), this.getImageProduct(dataValues.product_code)])

            result.push({
                cs_oid: dataValues.cs_oid,
                product_name: dataValues.product_name,
                product_code: dataValues.product_code,
                chart_quantity: dataValues.chart_quantity,
                available_quantity: detailStockProduct.quantity,
                sales_status: (dataValues.chart_quantity > detailStockProduct.quantity) ? 'melebihi stok' : 'bisa dibeli',
                can_be_sold: (dataValues.chart_quantity > detailStockProduct.quantity) ? false : true,
                price: dataValues.price,
                discount: dataValues.discount,
                created_at: dataValues.created_at,
                updated_at: dataValues.updated_at,
                photo: dataValues.photo
            })
        }

        return result;
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

    getDataChart = async (userid) => {
        let dataChart = await ChartSales.findAll({
            attributes: [
                'cs_oid',
                [Sequelize.col('product.pt_desc1'), 'product_name'],
                [Sequelize.col('product.pt_code'), 'product_code'],
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'chart_quantity'],
                [Sequelize.literal('CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)'), 'price'],
                [Sequelize.literal('ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)'), 'discount'],
                [Sequelize.literal(`CASE WHEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" IS NOT NULL THEN "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail" ELSE NULL END`), 'photo'],
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
                        }, {
                            model: ProductJubelio,
                            as: 'singular_product_jubelio',
                            attributes: [],
                            include: [
                                {
                                    model: ProductJubelioThumbnail,
                                    as: 'singular_thumbnail_product',
                                    attributes: []
                                }
                            ]
                        }
                    ]
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
            // logging: false
        })

        return dataChart;
    }

    getDetailStockProduct = async (ptCode) => {
        let result = await urlGetData(`/product/${ptCode}/detail`);

        return result;
    }
}

module.exports = new SalesV2Controller();