const {
    PiMstr, PidDet, PiddDet, Sequelize, sequelize, PtMstr, PtnrgGrp
} = require('../../models');
const {Op} = require('sequelize')

class PriceService {
    getPrice = async (productId, entityId, groupId, isFlashSale, spesificPrice) => {
        const result = await PidDet.findOne({
            attributes: [
                [Sequelize.literal(`master_price_list.pi_id`), 'pi_id'],
                [Sequelize.col(`master_price_list.pi_desc`), 'pricelist_name'],
                [Sequelize.literal(`CAST("singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
            ],
            include: [
                {
                    model: PiMstr,
                    as: 'master_price_list',
                    attributes: [],
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
                }),
                Sequelize.where(Sequelize.literal(`"master_price_list"."pi_ptnrg_id"`), {
                    [Op.eq]: groupId
                }),
                Sequelize.where(Sequelize.col(`"master_price_list"."pi_shown"`), {
                    [Op.eq]: 'Y'
                }),
                Sequelize.where(Sequelize.col(`"master_price_list"."pi_flashsale"`), {
                    [Op.eq]: isFlashSale
                }),
                Sequelize.where(Sequelize.col(`"master_price_list"."pi_spesific_price"`), {
                    [Op.eq]: spesificPrice
                })
            ],
        })

        return result;
    }

    getPriceGetDesc = async (productId) => {
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
            where: {
                pid_pt_id: {
                    [Op.eq]: productId,
                }
            },
            logging: false
        })

        return result;
    }

    getAllPriceGetDesc = async () => {
        const result = await PidDet.findAll({
            attributes: [
                ['pid_pt_id', 'pt_id'],
                [Sequelize.literal(`master_price_list.pi_id`), 'pi_id'],
                [Sequelize.col(`master_price_list.pi_desc`), 'pricelist_name'],
                [Sequelize.literal(`CAST("singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
                [Sequelize.literal(`"product"."pt_code"`), 'pt_code']
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
                }, {
                    model: PtMstr,
                    as: 'product',
                    attributes: []
                }
            ],
            logging: false
        })

        return result;
    }

    getPriceFlashSale = async (productId, entityId) => {
        const result = await PidDet.findOne({
            attributes: [
                [Sequelize.literal(`master_price_list.pi_id`), 'pi_id'],
                [Sequelize.col(`master_price_list.pi_desc`), 'pricelist_name'],
                [Sequelize.literal(`CAST("singular_detail_price_list"."pidd_price" AS INTEGER)`), 'price'],
                [Sequelize.literal(`ROUND("singular_detail_price_list"."pidd_disc", 2)`), 'discount'],
            ],
            include: [
                {
                    model: PiMstr,
                    as: 'master_price_list',
                    attributes: [],
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
                }),
                Sequelize.where(Sequelize.literal(`"master_price_list"."pi_oid"`), {
                    [Op.in]: ['2493473d-f084-4150-a6ed-7c121a240608', '0fd554aa-f8e8-44b1-b8fa-15e4e9753013', '37aecb7a-e6e2-4bbc-a4d2-818e9954de81']
                })
            ],
        })

        return result;
    }

    retrievePriceName = async ( search ) => {
        const result = await PiMstr.findAll({
            attributes: [
                'pi_oid',
                ['pi_id', 'pricelist_id'],
                ['pi_desc', 'pricelist_desc'],
                ['pi_shown', 'show'],
                ['pi_flashsale', 'flashsale'],
                ['pi_spesific_price', 'show_in_another_program'],
                [Sequelize.literal(`"group_pricelist"."ptnrg_name"`), 'group_name']
            ],
            include: [
                {
                    model: PtnrgGrp,
                    as: 'group_pricelist',
                    attributes: []
                }
            ],
            where: {
                pi_desc: {
                    [Op.iLike]: `%${search}%`
                }
            },
            order: [
                ['pi_shown', 'ASC']
            ]
        });

        return result;
    }

    updateStatusPriceList = async (isShown, isFlashSale, isAnotherProgram, priceListOid) => {
        console.info(isShown, isFlashSale, isAnotherProgram, priceListOid)

        let result = await PiMstr.update({
            pi_shown: isShown,
            pi_flashsale: isFlashSale,
            pi_spesific_price: isAnotherProgram
        }, {
            where: {
                pi_oid: priceListOid
            },
            logging: (sqlCommand) => {
                console.info(sqlCommand)
            }
        });

        return result;
    }
}

module.exports = new PriceService();