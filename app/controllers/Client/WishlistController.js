const {
    PiddDet, PiMstr,
    Wishlist, PtMstr,
    InvcMstr, PidDet,
    Sequelize, sequelize,
    ProductJubelio, ProductJubelioThumbnail
} = require('../../../models');
const axios = require('axios');
const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const Auth = require('../../../helper/Auth');
const {config} = require('../../../config/environment');

class WishlistController {
    index = async (req, res) => {
        try {
            let dataProduct = await Wishlist.findAll({
                attributes: [
                    'wl_oid',
                    [Sequelize.col('"product"."pt_desc1"'), 'product_name'],
                    [Sequelize.col('"product"."pt_code"'), 'product_code'],
                    [Sequelize.literal('CAST(wl_qty AS BIGINT)'), 'wishlist_quantity'],
                    [Sequelize.literal('CAST("inventory_product"."invc_qty_available" AS BIGINT)'), 'available_quantity'],
                    [Sequelize.literal(`CASE WHEN wl_qty > "inventory_product"."invc_qty_available" THEN 'permintaan melebihi stok' ELSE 'bisa dibeli' END`), 'sales_status'],
                    [Sequelize.literal(`CASE WHEN wl_qty > "inventory_product"."invc_qty_available" THEN false ELSE true END`), 'can_be_sold`'],
                    [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), "unit_price"],
                    [Sequelize.literal(`CAST("product->singular_relation_price_list->singular_detail_price_list"."pidd_price" * wl_qty AS BIGINT)`), "total_price"],
                    [Sequelize.literal(`ROUND("product->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), "discount"],
                    ['wl_created_at', 'created_at'],
                    ['wl_updated_at', 'updated_at'],
                    ['wl_status', 'status']
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
                                        model: PiddDet.scope('cashPaymentType'),
                                        as: 'singular_detail_price_list',
                                        attributes: []
                                    }
                                ]
                            }
                        ]
                    }, {
                        model: InvcMstr.scope('gudangReguler'),
                        as: 'inventory_product',
                        attributes: []
                    }
                ],
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('wl_user_id'), {
                            [Op.eq]: Auth.user().userid,
                        }),
                        Sequelize.where(Sequelize.col('"product->singular_relation_price_list"."pid_pi_oid"'), {
                            [Op.eq]: Sequelize.literal(`(SELECT pi_oid FROM public.pi_mstr WHERE pi_id = wl_pi_id)`)
                        }),
                        Sequelize.where(Sequelize.col(`wl_is_po`), {
                            [Op.eq]: false
                        })
                    ]
                },
                logging: false
            })

            let result = await this.getImages(dataProduct);

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        } catch (error) {
            res.status(500)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    store = async (req, res) => {
        try {
            let dataOld = await this.getDataWishlist(req.body.product_id, Auth.user().userid);

            if (dataOld == null) {
                await this.createWishlist(req.body);
            } else {
                let {dataValues} = dataOld;
                await this.updateWishlist(req.body, dataValues.wl_oid, dataValues.wl_qty);
            }

            res.status(200)
                .json({
                    status: 'success',
                    message: 'data berhasil ditambahkan',
                    data: true,
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

    destroy = async (req, res) => {
        try {
            let statusWishlist = await this.checkWishlistStatus(req.params.wishlistOid);

            if (statusWishlist == false) {
                res.status(300)
                    .json({
                        status: 'failed',
                        message: 'produk sudah diorder!',
                        data: null,
                        error: null
                    });

                return;
            }

            await Wishlist.destroy({
                where: {
                    wl_oid: req.params.wishlistOid,
                    wl_user_id: Auth.user().userid
                },
                logging: false
            })

            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: 1,
                    error: null
                })
        } catch (error) {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        }
    }

    checkWishlistStatus = async (wishlistOid) => {
        let dataResult = await Wishlist.findOne({
            attributes: [
                [Sequelize.literal(`CASE WHEN wl_status != 'wishlist' THEN FALSE ELSE TRUE END`), 'wishlist_status']
            ],
            where: {
                wl_oid: wishlistOid,
                wl_user_id: Auth.user().userid
            },
            logging: false
        });

        return (dataResult) ? dataResult.dataValues.wishlist_status : false;
    }

    getDataWishlist = async (productId, userId) => {
        let data = await Wishlist.findOne({
            attributes: [
                'wl_oid',
                [Sequelize.literal('CAST(wl_qty AS INTEGER)'), 'wl_qty']
            ],
            where: {
                wl_pt_id: productId,
                wl_user_id: userId,
                wl_status: 'wishlist'
            },
            logging: false
        })

        return data;
    }

    createWishlist = async (request) => {
        await Wishlist.create({
            wl_oid: uuidv4(),
            wl_user_id: Auth.user().userid,
            wl_pt_id: request.product_id,
            wl_qty: request.quantity,
            wl_en_id: request.entity_id,
            wl_invc_oid: request.inventory_oid,
            wl_pi_id: request.pricelist_id,
            wl_created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            wl_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            wl_status: 'wishlist',
            wl_is_po: false
        }, {
            logging: false
        })
    }

    updateWishlist = async (request, wishlistOid, qtyOld) => {
        await Wishlist.update({
            wl_qty: qtyOld + parseInt(request.quantity)
        }, {
            where: {
                wl_oid: wishlistOid
            },
            logging: false
        })
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
                    wl_oid: item.wl_oid,
                    product_name: item.product_name,
                    product_code: item.product_code,
                    wishlist_quantity: item.wishlist_quantity,
                    available_quantity: item.available_quantity,
                    sales_status: item.sales_status,
                    can_be_sold: item.can_be_sold,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    discount: item.discount,
                    photo: (picture.length == 0) ? null : picture[0]['picture'],
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    status: item.status
                }
            })
        
            return result;
        }
}

module.exports = new WishlistController();