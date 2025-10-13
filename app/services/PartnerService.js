const {DbgGroup, DbgdDet, LocMstr, PtnrMstr, Sequelize, PtnrgGrp, PtnraAddr, PtnracCntc} = require('../../models');
const { Op, or } = require('sequelize');
const moment = require('moment');

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

    getDataPartnerByEntity = async (entityId, search) => {
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
                ptnr_en_id: entityId,
                ptnr_name: {
                    [Op.iLike]: `%${search}%`
                },
                ptnr_active: 'Y'
            }
        });

        return result;
    }

    getDataSalesByEntity = async (entityId) => {
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
                ptnr_en_id: entityId,
                ptnr_is_emp: 'Y'
            }
        });

        return result;
    }

    retrieveDataPartnerIdByEntity = async (entityId) => {
        let result = await PtnrMstr.findOne({
            attributes: [
                [Sequelize.literal(`ptnr_id + 1`), 'partner_id']
            ],
            where: {
                ptnr_en_id: entityId
            },
            order: [
                ['ptnr_id', 'DESC']
            ]
        });

        return result;
    }

    retrieveDataAddressIdByEntity = async (entityId) => {
        let result = await PtnraAddr.findOne({
            attributes: [
                [Sequelize.literal(`ptnra_id + 1`), 'address_id']
            ],
            where: {
                ptnra_en_id: entityId
            },
            order: [
                ['ptnra_id', 'DESC']
            ]
        })

        return result;
    }

    retrieveDataLocationIdByEntity = async (entityId) => {
        let result = await LocMstr.findOne({
            attributes: [
                [Sequelize.literal(`loc_id + 1`), 'location_id']
            ],
            where: {
                loc_en_id: entityId
            },
            order: [
                ['loc_id', 'DESC']
            ]
        });

        return result;
    }

    countAddedGrouping = async () => {
        let result = await DbgGroup.count({
            where: [
                Sequelize.where(Sequelize.literal(`YEAR(dbg_add_date)`), {
                    [Op.eq]: moment().format('YYYY')
                })
            ]
        });

        return result;
    }

    retrieveDataGroupId = async () => {
        let result = await DbgGroup.findOne({
            attributes: [
                [Sequelize.literal(`dbg_id + 1`), 'group_id']
            ],
            order: [
                ['dbg_id', 'DESC']
            ]
        });

        return result;
    }

    insertDataPartner = async (data, transaction) => await PtnrMstr.bulkCreate(data, { transaction })
    insertDataAddressPartner = async (data, transaction) => await PtnraAddr.bulkCreate(data, { transaction })
    insertDataContactPartner = async (data, transaction) => await PtnracCntc.bulkCreate(data, { transaction })
    insertDataHeaderGrouping = async (data, transaction) => await DbgGroup.create(data, { transaction })
    insertDataDetailGrouping = async (data, transaction) => await DbgdDet.bulkCreate(data, { transaction })
}

module.exports = new PartnerService();