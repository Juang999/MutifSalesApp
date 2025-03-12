const {
    InvcMstr, 
    InvcdDet, PtMstr, 
    Sequelize, sequelize
} = require('../../models')
const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');
const {insertBulkQuery, insertQuery} = require('../../helper/InputQueryIntoSqlOut');

class InventoryService {
    getProductKnowledgePusat = async (productId, partNumber) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_en_id', 'entity_id'],
                ['pt_id', 'product_id'],
                ['pt_code', 'product_code'],
                [Sequelize.literal("CASE WHEN pt_en_id = 1 THEN 10001 WHEN pt_en_id = 2 THEN 200010 WHEN pt_en_id = 3 THEN 300018 END"), 'location_id']
            ],
            where: {
                [Op.or]: [
                    {pt_id: productId},
                    {pt_code: partNumber}
                ]
            },
            logging: false
        })

        return result
    }

    getProductKnowledgeReguler = async (productId, partNumber) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_en_id', 'entity_id'],
                ['pt_id', 'product_id'],
                ['pt_code', 'product_code'],
                [Sequelize.literal("CASE WHEN pt_en_id = 1 THEN 1000555 WHEN pt_en_id = 2 THEN 2000556 WHEN pt_en_id = 3 THEN 3000557 END"), 'location_id']
            ],
            where: {
                [Op.or]: [
                    {pt_id: productId},
                    {pt_code: partNumber}
                ]
            },
            logging: false
        })

        return result
    }

    checkExistanceUnique = async (serialNumber, partNumber, productId) => {
        let result = await InvcdDet.findOne({
            attributes: ["invcd_alias_qrbarcode"],
            include: [
                {
                    model: PtMstr,
                    as: 'detail_inventory',
                    attributes: []
                }
            ],
            where: [
                Sequelize.where(Sequelize.col("invcd_alias_qrbarcode"), {
                    [Op.eq]: serialNumber
                }),
                Sequelize.or([
                    Sequelize.where(Sequelize.col(`"detail_inventory"."pt_code"`), {
                        [Op.eq]: partNumber
                    }),
                    Sequelize.where(Sequelize.col(`"detail_inventory"."pt_id"`), {
                        [Op.eq]: productId
                    })
                ])
            ],
            logging: false
        })

        return (result) ? true : false
    }

    updateIncomeUnique = async (serialNumber, productId, quantity) => {
        let result = await InvcdDet.update({
            invcd_qty: quantity,
            invcd_upd_by: 'system-getdesc',
            invcd_upd_date: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: {
                invcd_alias_qrbarcode: serialNumber,
                invcd_pt_id: productId
            },
            logging: async (sqlCommand, {bind}) => {
                const realSql = sqlCommand.replace("Executing (default): ", "");

                await insertQuery(realSql, bind);
            }
        })

        return result;
    }

    createNewUnique = async (requirement, serialNumber) => {
        let result = null;

        if (requirement ) {
            let dataProduct = require.dataValues;

            result = await InvcdDet.create({
                invcd_oid: uuidv4(),
                invcd_dom_id: 1,
                invcd_en_id: dataProduct.entity_id,
                invcd_pt_id: dataProduct.product_id,
                invcd_qty: 1,
                invcd_loc_id: dataProduct.location_id,
                invcd_um: 9964,
                invcd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                invcd_add_by: 'system-getdesc',
                invcd_is_verified: (dataProduct.product_code.substring(0, 6) == 'AMS240') ? 'Y' : 'N',
                invcd_alias_qrbarcode: serialNumber
            }, {
                logging: async (query, {bind}) => {
                    const realSql = query.replace("Executing (default): ", "");

                    await insertQuery(realSql, bind);
                }
            })
        }

        return result;
    }

    getDataInventory = async (inventoryOid, transaction) => {
        let result = await InvcMstr.findOne({
            attributes: [
                'invc_oid',
                [Sequelize.literal('CAST(invc_qty_available AS INTEGER)'), 'qty_available'],
                [Sequelize.literal('CAST(invc_qty_booked AS INTEGER)'), 'qty_booked'],
            ],
            transaction: transaction,
            where: {
                invc_oid: inventoryOid
            },
            logging: false
        })

        return result;
    }

    getDataInventoryByProductIdAndEntityId = async (productId, entityId) => {
        let result = await InvcMstr.scope({method: ['matchEntityWithLocation', entityId]}).findAll({
            attributes: [
                'invc_oid',
                [Sequelize.literal('CAST(invc_qty_available AS INTEGER)'), 'invc_qty_available']
            ],
            where: {
                invc_pt_id: productId
            }
        })

        return result;
    }

    bookProductQuantity = async (inventoryOid, quantity, transaction) => {
        let result = await InvcMstr.update({
            invc_qty_available: quantity.quantityAvailable,
            invc_qty_booked: quantity.quantityBooked
        }, {
            where: {
                invc_oid: inventoryOid
            },
            individualHooks: true,
            transaction,
            logging: async (sqlCommand, {bind}) => {
                let realSql = sqlCommand.split(': ')[1]

                await insertQuery(realSql, bind, 1);
            }
        })

        return result;
    }

    bookProductQuantit2 = async (inventoryOid, quantity, transaction) => {
        let result = await InvcMstr.update({
            invc_qty_available: Sequelize.literal(`CAST(invc_qty_available AS INTEGER) - ${parseInt(quantity)}`),
            invc_qty_booked: Sequelize.literal(`CAST(invc_qty_booked AS INTEGER) + ${parseInt(quantity)}`)
        }, {
            where: {
                invc_oid: inventoryOid
            },
            individualHooks: true,
            transaction,
            logging: async (sqlCommand, {bind}) => {
                let realSql = sqlCommand.split(': ')[1]

                await insertQuery(realSql, bind, 1);
            }
        })

        return result;
    }

    getStockBySerial = async (productId, limit, transaction) => {
        let data = await InvcdDet.scope('gudangReguler').findAll({
            attributes: [
                'invcd_oid',
            ],
            where: {
                invcd_qty: 1,
                invcd_pt_id: productId,
                invcd_is_verified: 'Y',
                invcd_is_booked: {
                    [Op.is]: null
                },
                invcd_cs_oid: {
                    [Op.is]: null
                },
                invcd_transaction_code: {
                    [Op.is]: null
                }
            },
            limit,
            transaction,
            logging: false
        })

        return data;
    }
}

module.exports = new InventoryService();