const {DbgGroup, DbgdDet, LocMstr, Sequelize} = require('../../models');

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
}

module.exports = new PartnerService();