const moment = require('moment');
const {v4: uuidv4} = require('uuid');
const {InvcdDet, PtMstr, Sequelize, sequelize} = require('../../../models');
const {insertBulkQuery, insertQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {Op} = require('sequelize');

class StockController {
    insertNewStock = async (req, res) => {
        try {
            let productKnowledge = null;
            let valueUniq = null;

            if (req.body.gudang == 'pusat') {
                productKnowledge = await this.getProductKnowledgePusat(req.body);
            } else {
                productKnowledge = await this.getProductKnowledgeReguler(req.body);
            }

            if (productKnowledge) {
                valueUniq = this.createValuesForInsert(productKnowledge, req.body.uniq.split(','));

                valueUniq = await InvcdDet.create({
                    invcd_oid: uuidv4(),
                    invcd_dom_id: 1,
                    invcd_en_id: productKnowledge.dataValues.entity_id,
                    invcd_pt_id: productKnowledge.dataValues.product_id,
                    invcd_qty: 1,
                    invcd_loc_id: productKnowledge.dataValues.location_id,
                    invcd_um: 9964,
                    invcd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    invcd_add_by: 'system-getdesc',
                    invcd_is_verified: (productKnowledge.dataValues.product_code.substring(0, 6) == 'AMS240') ? 'Y' : 'N',
                    invcd_alias_qrbarcode: req.body.uniq
                }, {
                    logging: async (query, {bind}) => {
                        const realSql = query.replace("Executing (default): ", "");

                        await insertQuery(realSql, bind);
                    }
                })
            }

            res.status(200)
                .json({
                    status: 'success',
                    message: "ok",
                    data: {
                        existance_product: (productKnowledge) ? true : false,
                        data_product: (productKnowledge) ? productKnowledge : null,
                        created_unique: (valueUniq) ? true : false,
                        data_unique: (valueUniq) ? valueUniq : null
                    },
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

    getProductKnowledgePusat = async (body) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_en_id', 'entity_id'],
                ['pt_id', 'product_id'],
                ['pt_code', 'product_code'],
                [Sequelize.literal("CASE WHEN pt_en_id = 1 THEN 10001 WHEN pt_en_id = 2 THEN 200010 WHEN pt_en_id = 3 THEN 300018 END"), 'location_id']
            ],
            where: {
                [Op.or]: [
                    {pt_id: body.pt_id},
                    {pt_code: body.qr}
                ]
            },
            logging: false
        })

        return result
    }

    getProductKnowledgeReguler = async (body) => {
        let result = await PtMstr.findOne({
            attributes: [
                ['pt_en_id', 'entity_id'],
                ['pt_id', 'product_id'],
                ['pt_code', 'product_code'],
                [Sequelize.literal("CASE WHEN pt_en_id = 1 THEN 1000555 WHEN pt_en_id = 2 THEN 2000556 WHEN pt_en_id = 3 THEN 3000557 END"), 'location_id']
            ],
            where: {
                [Op.or]: [
                    {pt_id: body.pt_id},
                    {pt_code: body.qr}
                ]
            },
            logging: false
        })

        return result
    }

    createValuesForInsert = (requirement, data) => {
        let result = data.map((singular) => {
            return {
                invcd_oid: uuidv4(),
                invcd_dom_id: 1,
                invcd_en_id: requirement.dataValues.entity_id,
                invcd_pt_id: requirement.dataValues.product_id,
                invcd_qty: 1,
                invcd_loc_id: requirement.dataValues.location_id,
                invcd_um: 9964,
                invcd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                invcd_add_by: 'system',
                invcd_is_verified: (requirement.dataValues.product_code.substring(0, 6) == 'AMS240') ? 'Y' : 'N',
                invcd_alias_qrbarcode: singular
            }
        })

        // let result = data;

        return result;
    }
}

module.exports = new StockController();