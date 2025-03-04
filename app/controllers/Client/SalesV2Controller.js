const axios = require('axios');
const {Op} = require('sequelize');
const Auth = require('../../../helper/Auth');
const {config} = require('../../../config/environment');
const {info, error: errorLog} = require('../../../helper/Logging');
const {
    InvcdDet,
    PiddDet, sequelize,
    PtMstr, PidDet, Sequelize, 
    ChartSales, PiMstr, InvcMstr,
    ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');
const {InventoryService, CartService} = require('../../services/ServiceContainer');

class SalesV2Controller {
    getChart = async (req, res) => {
        let {userid} = Auth.user();

        CartService.retrieveDataCart(userid)
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
            errorLog('GET DATA CART V2', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
    }

    getLimitedCart = (req, res) => {
        let {userid} = Auth.user();

        Promise.all([CartService.getSubTotalPriceCart(userid), CartService.retrieveLimitedDataCart(userid)])
        .then(([subTotalPrice, dataCart]) => {

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: {
                        subtotal_price: subTotalPrice[0]['sum'],
                        cart: dataCart
                    },
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

    limitedDataCart = async (userid) => {
        let dataCart = await ChartSales.findAll({
            attributes: [
                'cs_oid',
                [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                [Sequelize.literal('CAST(cs_qty AS INTEGER)'), 'quantity'],
                [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.col(`CONCAT('', "product->singular_product_jubelio->singular_thumbnail_product"."pjt_thumbnail")`), 'photo']
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
                                    model: PiMstr.scope('priceListDistributor'),
                                    as: 'master_price_list',
                                    attributes: [],
                                }, {
                                    model: PiddDet.scope('creditPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: [],
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                cs_userid: userid
            },
            order: [
                ['cs_qty', 'DESC']
            ],
            limit: 15,
            logging: false
        })

        return dataCart;
    }

    getSubTotalPriceCart = async (userid) => {
        let [subTotal] = await sequelize.query(`
            SELECT 
                CAST(SUM("cs_qty" * ("detail_price_list"."pidd_price" - ("detail_price_list"."pidd_price" * "detail_price_list"."pidd_disc"))) AS BIGINT) 
            FROM public.chart_sales CS
            LEFT JOIN public.pt_mstr AS product ON product.pt_id = CS.cs_pt_id
            LEFT JOIN public.pid_det AS relation_price_list ON relation_price_list.pid_pt_id = product.pt_id
            LEFT JOIN public.pi_mstr AS master_price_list ON master_price_list.pi_oid = relation_price_list.pid_pi_oid
            LEFT JOIN public.pidd_det AS detail_price_list ON detail_price_list.pidd_pid_oid = relation_price_list.pid_oid
            WHERE
                cs_userid = :userid
            AND
                master_price_list.pi_id IN (103, 202, 304)
            AND
                detail_price_list.pidd_payment_type = 9942
            `, {
                replacements: {
                    userid
                },
                logging: false
            })

        return subTotal;
    }

    getImages = async (product) => {
        let partnumbers = product.map(({dataValues: item}) => {
            return item.product_code
        })
        
        const {parsed: configATPO} = config;
        let {data} = await axios.post(`${configATPO.URL_ATPO}/clothes/picture/bulk`, {
            partnumbers: partnumbers
        });
    
        let result = product.map(({dataValues: item}) => {
            let picture = data.data.filter((itemPicture) => itemPicture.partnumber == item.product_code)
    
            return {
                cs_oid: item.cs_oid,
                product_name: item.product_name,
                product_code: item.product_code,
                chart_quantity: item.chart_quantity,
                available_quantity: item.available_quantity,
                sales_status: item.sales_status,
                can_be_sold: item.can_be_sold,
                price: item.price,
                photo: (picture.length == 0) ? null : picture[0]['picture'],
                discount: item.discount,
                created_at: item.created_at,
                updated_at: item.updated_at
            }
        })
    
        return result;
    }
}

module.exports = new SalesV2Controller();