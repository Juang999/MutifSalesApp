const {
    PtMstr, EnMstr, 
    LocMstr,PiddDet, 
    InvcMstr, PidDet, 
    PiMstr, InvcdDet,
    PtCatMstr, Sequelize,
} = require('../../models');
const {Op} = require('sequelize');

class ProductService {
    getProduct = async (query, groupId, isFlashSale, spesificPrice) => {
        let productName = (query.search) ? query.search : '';
        let priceSort = (query.price_sort) ? query.price_sort : 'ASC';
        let newArrivalSort = (query.new_arrival_sort) ? query.new_arrival_sort : 'DESC';

        let result = await InvcMstr.findAll({
            attributes: [
                [Sequelize.col(`product_knowledge.pt_id`), 'product_id'],
                [Sequelize.col(`product_knowledge.pt_desc1`), 'product_name'],
                [Sequelize.col(`product_knowledge.pt_code`), 'product_code'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', "product_knowledge"."pt_code", '.jpg')`), 'thumbnail'],
                [Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`), 'entity'],
                [Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal(`CAST("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), 'price'],
                [Sequelize.literal(`ROUND("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`CAST(SUM(invc_qty_available) AS BIGINT)`), 'qty'],
                [Sequelize.literal(`'N'`), 'flashsale'],
            ],
            include: [
                {
                    model: PtMstr,
                    as: 'product_knowledge',
                    attributes: [],
                    include: [
                        {
                            model: EnMstr,
                            as: 'entity_product',
                            attributes: []
                        }, {
                            model: PtCatMstr,
                            as: 'master_category',
                            attributes: []
                        }, {
                            model: PidDet,
                            as: 'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
                                    model: PiddDet.scope('creditPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: []
                                }, {
                                    model: PiMstr,
                                    as: 'master_price_list',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.literal(`"product_knowledge"."pt_desc1"`), {
                        [Op.iLike]: `%${productName}%`
                    }),
                    Sequelize.where(Sequelize.literal(`"product_knowledge->singular_relation_price_list->master_price_list"."pi_ptnrg_id"`), {
                        [Op.eq]: groupId
                    }),
                    Sequelize.where(Sequelize.literal(`"product_knowledge->singular_relation_price_list->master_price_list"."pi_shown"`), {
                        [Op.eq]: 'Y'
                    }),
                    Sequelize.where(Sequelize.literal(`"product_knowledge->singular_relation_price_list->master_price_list"."pi_flashsale"`), {
                        [Op.eq]: isFlashSale
                    }),
                    Sequelize.where(Sequelize.literal(`"product_knowledge->singular_relation_price_list->master_price_list"."pi_spesific_price"`), {
                        [Op.eq]: spesificPrice
                    }),
                ],
                [Op.or]: [
                    {
                        [Op.and]: [
                            Sequelize.where(Sequelize.col(`invc_en_id`), {
                                [Op.eq]: Sequelize.literal(`"product_knowledge"."pt_en_id"`)
                            }),
                            Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                [Op.in]: [1002718]
                            }),
                            Sequelize.where(Sequelize.col(`invc_qty_available`), {
                                [Op.gte]: 0
                            })
                        ],
                    }, 
                    {
                        [Op.and]: [
                            Sequelize.where(Sequelize.col(`invc_en_id`), {
                                [Op.eq]: Sequelize.literal(`"product_knowledge"."pt_en_id"`)
                            }),
                            Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                [Op.in]: [2002719]
                            }),
                            Sequelize.where(Sequelize.col(`invc_qty_available`), {
                                [Op.gte]: 0
                            })
                        ],
                    }, {
                        [Op.and]: [
                            Sequelize.where(Sequelize.col(`invc_en_id`), {
                                [Op.eq]: Sequelize.literal(`"product_knowledge"."pt_en_id"`)
                            }),
                            Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                [Op.in]: [3002720]
                            }),
                            Sequelize.where(Sequelize.col(`invc_qty_available`), {
                                [Op.gte]: 0
                            })
                        ],
                    }
                ]
            },
            group: [
                'invc_en_id',
                Sequelize.col(`product_knowledge.pt_id`),
                Sequelize.col(`product_knowledge.pt_code`),
                Sequelize.col(`product_knowledge.pt_desc1`),
                Sequelize.col(`product_knowledge.pt_cat_id`),
                Sequelize.col(`product_knowledge.pt_add_date`),
                Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`),
                Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price"`),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`),
            ],
            order: [
                [Sequelize.col(`product_knowledge.pt_cat_id`), 'ASC'],
                [Sequelize.col(`product_knowledge.pt_add_date`), newArrivalSort],
                ['price', priceSort],
            ],
        })

        return result;
    }

    getProductFlashSale = async (query, groupId) => {
        let productName = (query.search) ? query.search : '';

        let result = await InvcdDet.findAll({
            attributes: [
                ['invcd_pt_id', 'product_id'],
                [Sequelize.col(`"detail_inventory"."pt_desc1"`), 'product_name'],
                [Sequelize.col(`"detail_inventory"."pt_code"`), 'product_code'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', "detail_inventory"."pt_code", '.jpg')`), 'thumbnail'],
                [Sequelize.literal(`"entity_product"."en_desc"`), 'entity'],
                [Sequelize.literal('"detail_inventory->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal(`CAST("detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), 'price'],
                [Sequelize.literal(`ROUND("detail_inventory->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`COUNT(invcd_qty)`), 'qty'],
                [Sequelize.literal(`'Y'`), 'flashsale'],
            ],
        include: [
                {
                    model: PtMstr,
                    as: 'detail_inventory',
                    attributes: [],
                    include: [
                        {
                            model: PtCatMstr,
                            as: 'master_category',
                            attributes: []
                        }, {
                            model: PidDet,
                            as: 'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
                                    model: PiMstr,
                                    as: 'master_price_list',
                                    attributes: []
                                }, {
                                    model: PiddDet.scope('creditPaymentType'),
                                    as: 'singular_detail_price_list',
                                    attributes: []
                                }
                            ]
                        }
                    ]
                }, {
                    model: EnMstr,
                    as: 'entity_product',
                    attributes: []
                }
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.col(`invcd_qty`), {
                        [Op.eq]: 1
                    }),
                    Sequelize.where(Sequelize.col(`invcd_booking`), {
                        [Op.not]: true
                    }),
                    Sequelize.where(Sequelize.col(`invcd_qrbarcode`), {
                        [Op.not]: null
                    }),
                    Sequelize.where(Sequelize.col(`"detail_inventory"."pt_desc1"`), {
                        [Op.iLike]: `%${productName}%`
                    }),
                    Sequelize.where(Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_ptnrg_id"`), {
                        [Op.eq]: groupId
                    }),
                    Sequelize.where(Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_shown"`), {
                        [Op.eq]: `Y`
                    }),
                    Sequelize.where(Sequelize.col(`"detail_inventory->singular_relation_price_list->master_price_list"."pi_flashsale"`), {
                        [Op.eq]: 'Y'
                    }),
                ],
                [Op.or]: [
                    {
                        invcd_loc_id: {
                            [Op.in]: [1002718]
                        }
                    }, {
                        invcd_loc_id: {
                            [Op.in]: [2002719]
                        }
                    }, {
                        invcd_loc_id: {
                            [Op.in]: [3002720]
                        }
                    }
                ]
            },
            group: [
                'product_id',
                'product_name',
                'product_code',
                'entity',
                'category',
                'price',
                'discount'
            ],
            order: [
                ['qty', 'DESC']
            ]
        });

        return result;
    }

    getDetailProduct = async (param) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_id', 'product_id'],
                ['pt_desc1', 'product_name'],
                ['pt_code', 'product_code'],
                'pt_en_id',
                [Sequelize.literal('CAST(pt_weight AS INTEGER)'), 'product_weight'],
                [Sequelize.literal('CAST(pt_height AS INTEGER)'), 'product_height'],
                [Sequelize.literal('CAST(pt_width AS INTEGER)'), 'product_width'],
                [Sequelize.literal('CAST(pt_length AS INTEGER)'), 'product_length'],
                [Sequelize.literal(`'N'`), 'flashsale'],
            ],
            include: [
                {
                    model: InvcMstr,
                    as: 'product_quantity',
                    attributes: [
                        'invc_oid',
                        [Sequelize.literal(`"product_quantity->location"."loc_desc"`), 'data_location'],
                        [Sequelize.literal(`"product_quantity->entity_inventory"."en_desc"`), 'entity'],
                        'invc_loc_id',
                        [Sequelize.literal('CAST(invc_qty_available AS INTEGER)'), 'quantity'],
                    ],
                    include: [
                        {
                            model: LocMstr,
                            as: 'location',
                            attributes: []
                        }, {
                            model: EnMstr,
                            as: 'entity_inventory',
                            attributes: []
                        }
                    ],
                    where: {
                        [Op.or]: [
                            {
                                [Op.and]: [
                                    Sequelize.where(Sequelize.col(`invc_en_id`), {
                                        [Op.eq]: Sequelize.literal(`"pt_en_id"`)
                                    }),
                                    Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                        [Op.in]: [1002718]
                                    }),
                                    Sequelize.where(Sequelize.col(`invc_qty_available`), {
                                        [Op.gte]: 0
                                    })
                                ],
                            }, 
                            {
                                [Op.and]: [
                                    Sequelize.where(Sequelize.col(`invc_en_id`), {
                                        [Op.eq]: Sequelize.literal(`"pt_en_id"`)
                                    }),
                                    Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                        [Op.in]: [2002719]
                                    }),
                                    Sequelize.where(Sequelize.col(`invc_qty_available`), {
                                        [Op.gte]: 0
                                    })
                                ],
                            }, {
                                [Op.and]: [
                                    Sequelize.where(Sequelize.col(`invc_en_id`), {
                                        [Op.eq]: Sequelize.literal(`"pt_en_id"`)
                                    }),
                                    Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                        [Op.in]: [3002720]
                                    }),
                                    Sequelize.where(Sequelize.col(`invc_qty_available`), {
                                        [Op.gte]: 0
                                    })
                                ],
                            }
                        ]
                    }
                }
            ],
            where: {
                pt_code: param.product_code,
                pt_shown: 'Y'
            },
        })

        return result
    }

    getDetailproductFlashSale = async (partnumber) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_id', 'product_id'],
                ['pt_desc1', 'product_name'],
                ['pt_code', 'product_code'],
                'pt_en_id',
                [Sequelize.literal('CAST(pt_weight AS INTEGER)'), 'product_weight'],
                [Sequelize.literal('CAST(pt_height AS INTEGER)'), 'product_height'],
                [Sequelize.literal('CAST(pt_width AS INTEGER)'), 'product_width'],
                [Sequelize.literal('CAST(pt_length AS INTEGER)'), 'product_length'],
                [Sequelize.literal(`'Y'`), 'flashsale'],
            ],
            where: {
                pt_code: partnumber
            }
        });

        return result;
    }
}

module.exports = new ProductService();