const {DbgGroup, DbgdDet, LocMstr, PtnrMstr, Sequelize, PtnrgGrp} = require('../../models');

class PartnerService {
    getLocationPartner = async (partnerId) => {
        let result = await DbgdDet.scope({method: ['filterGroup', partnerId]}).findAll({
            attributes: [
                'dbgd_en_id',
                [Sequelize.col(`"singular_relation_partner_location"."loc_id"`), 'destination_location_id']
            ],
            include: [
                {
                    model: LocMstr,
                    as: 'singular_relation_partner_location',
                    attributes: []
                }
            ],
            order: [
                ['dbgd_ptnr_id', 'ASC']
            ]
        })

        return result;
    }

    getPartnerReference = async (partnerCode) => {
        let result = await PtnrMstr.findOne({
            attributes: ['ptnr_id', 'ptnr_code', 'ptnr_name'],
            where: {
                ptnr_code: partnerCode
            }
        });

        return result;
    }

    getDataPartnerByEntity = async (entityId) => {
        let result = await PtnrMstr.findAll({
            attributes: [
                ['ptnr_id', 'id'], 
                ['ptnr_name', 'partner_name'],
                [Sequelize.col(`group_partner.ptnrg_desc`), 'group_name']
            ],
            include: [
                {
                    model: PtnrgGrp,
                    as: 'group_partner',
                    attributes: []
                }
            ],
            where: {
                ptnr_en_id: entityId
            }
        });

        return result;
    }
}

module.exports = new PartnerService();