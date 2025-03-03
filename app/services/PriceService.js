const {
    PiMstr, PidDet, PiddDet, Sequelize, sequelize
} = require('../../models');
const {Op} = require('sequelize')

class PriceService {
    getPrice = async (productId, entityId) => {
        const result = await PidDet.findOne({
            attributes: [
                [Sequelize.literal(`master_price_list.pi_id`), 'pi_id'],
                [Sequelize.col(`master_price_list.pi_desc`), 'pricelist_name'],
                [Sequelize.literal(`CAST("singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
            ],
            include: [
                {
                    model: PiMstr.scope('priceListDistributor'),
                    as: 'master_price_list',
                    attributes: []
                }, {
                    model: PiddDet.scope('creditPaymentType'),
                    as: 'singular_detail_price_list',
                    attributes: []
                }
            ],
            where: [
                Sequelize.where(Sequelize.col('pid_pt_id'), {
                    [Op.eq]: productId,
                }),
                Sequelize.where(Sequelize.literal(`"master_price_list"."pi_en_id"`), {
                    [Op.eq]: entityId
                })
            ]
        })

        return result;
    }
}

module.exports = new PriceService();