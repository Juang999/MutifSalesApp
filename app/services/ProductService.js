const {
    PtMstr, EnMstr, 
    PiddDet, SodDet, 
    InvcMstr, PidDet, 
    PtCatMstr, SoMstr, 
    Sequelize, PiMstr, 
    ProductJubelioThumbnail, ProductJubelio
} = require('../../models');
const moment = require('moment');
const {Op} = require('sequelize')
const Auth = require('../../helper/Auth');
const Page = require('../../helper/Page');
const {getData} = require('../../helper/ProductUrl');
const {info, error: errorLog} = require('../../helper/Logging');

class ProductService {
    getProduct = async (query) => {
        let productName = (query.search) ? query.search : '';
        // let {ptnrg_id} = Auth.user();
        let currentPage = (query.page) ? query.page : 1;
        let {page, limit, offset} = new Page(currentPage, 15);

        let result = await InvcMstr.scope('gudangSesuaiDenganEntitas', 'isVerified').findAndCountAll({
            attributes: [
                [Sequelize.col(`product_knowledge.pt_id`), 'product_id'],
                [Sequelize.col(`product_knowledge.pt_desc1`), 'product_name'],
                [Sequelize.col(`product_knowledge.pt_code`), 'product_code'],
                [Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`), 'entity'],
                [Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'), 'category'],
                [Sequelize.literal(`CAST("product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
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
                            model: PidDet.scope('priceListDistributor'),
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
            where: [
                Sequelize.where(Sequelize.literal(`"product_knowledge"."pt_desc1"`), {
                    [Op.iLike]: `%${productName}%`
                })
            ],
            group: [
                'invc_en_id',
                Sequelize.col(`product_knowledge.pt_id`),
                Sequelize.col(`product_knowledge.pt_desc1`),
                Sequelize.col(`product_knowledge.pt_code`),
                Sequelize.literal(`"product_knowledge->entity_product"."en_desc"`),
                Sequelize.literal('"product_knowledge->master_category"."ptcat_desc"'),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_price"`),
                Sequelize.literal(`"product_knowledge->singular_relation_price_list->singular_detail_price_list"."pidd_disc"`)
            ],
            order: [
                ['qty', 'DESC']
            ],
            limit,
            offset
        })

        return {
            count: result.count.length, 
            rows: result.rows
        };
    }
}

module.exports = new ProductService();