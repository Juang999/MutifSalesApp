const {
    PtMstr, EnMstr, 
    LocMstr,PiddDet, 
    InvcMstr, PidDet, 
    PtCatMstr, Sequelize,
} = require('../../models');
const {Op} = require('sequelize');

class ProductService {
    getProduct = async (query, groupId) => {
        let productName = (query.search) ? query.search : '';

        let result = await InvcMstr.findAll({
            attributes: [
                [Sequelize.col(`product_knowledge.pt_id`), 'product_id'],
                [Sequelize.col(`product_knowledge.pt_desc_jubelio`), 'product_name'],
                [Sequelize.col(`product_knowledge.pt_code`), 'product_code'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', "product_knowledge"."pt_code", '.jpg')`), 'thumbnail'],
                [Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`), 'entity'],
                [Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal(`CAST("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS BIGINT)`), 'price'],
                [Sequelize.literal(`ROUND("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`CAST(SUM(invc_qty_available) AS BIGINT)`), 'qty'],
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
                            model: PidDet.scope({method: ['priceListGroup', groupId]}),
                            as: 'singular_relation_price_list',
                            attributes: [],
                            include: [
                                {
                                    model: PiddDet.scope('creditPaymentType'),
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
                    Sequelize.where(Sequelize.literal(`"product_knowledge"."pt_desc_jubelio"`), {
                        [Op.iLike]: `%${productName}%`
                    }),
                    Sequelize.where(Sequelize.literal(`"product_knowledge"."pt_shown"`), {
                        [Op.eq]: `Y`
                    }),
                ],
                [Op.or]: [
                    {
                        [Op.and]: [
                            Sequelize.where(Sequelize.col(`invc_en_id`), {
                                [Op.eq]: Sequelize.literal(`"product_knowledge"."pt_en_id"`)
                            }),
                            Sequelize.where(Sequelize.col(`invc_loc_id`), {
                                [Op.in]: [10001, 1000555]
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
                                [Op.in]: [200010, 2000556]
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
                                [Op.in]: [300018, 3000557]
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
                Sequelize.col(`product_knowledge.pt_desc_jubelio`),
                Sequelize.col(`product_knowledge.pt_code`),
                Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`),
                Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price"`),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`),
            ],
            order: [
                ['qty', 'DESC']
            ],
        })

        return result;
    }

    getDetailProduct = async (param) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_id', 'product_id'],
                ['pt_desc_jubelio', 'product_name'],
                ['pt_code', 'product_code'],
                'pt_en_id',
                [Sequelize.literal('CAST(pt_weight AS INTEGER)'), 'product_weight'],
                [Sequelize.literal('CAST(pt_height AS INTEGER)'), 'product_height'],
                [Sequelize.literal('CAST(pt_width AS INTEGER)'), 'product_width'],
                [Sequelize.literal('CAST(pt_length AS INTEGER)'), 'product_length'],
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
                                        [Op.in]: [10001, 1000555]
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
                                        [Op.in]: [200010, 2000556]
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
                                        [Op.in]: [300018, 3000557]
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
            logging: false
        })

        return result
    }

    
}

module.exports = new ProductService();