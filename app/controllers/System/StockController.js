const moment = require('moment');
const {v4: uuidv4} = require('uuid');
const {InvcdDet, PtMstr, Sequelize, sequelize} = require('../../../models');
const {insertBulkQuery, insertQuery} = require('../../../helper/InputQueryIntoSqlOut');
const {Op} = require('sequelize');

class StockController {
    insertNewStock = async (req, res) => {
        try {
            let productKnowledge = null;
            let status = '';
            let valueUniq = null;

            if (req.body.gudang == 'pusat') {
                productKnowledge = await this.getProductKnowledgePusat(req.body);
            } else {
                productKnowledge = await this.getProductKnowledgeReguler(req.body);
            }

            if (await this.checkExistanceUnique(req.body) == true) {
                status = 'updated';
                await this.updateIncomeUnique(req.body, 1)
            } else {
                status = 'created';
                valueUniq = await this.createNewUnique(productKnowledge, req.body)
            }

            

            res.status(200)
                .json({
                    status: 'success',
                    message: "ok",
                    data: {
                        existance_product: (productKnowledge) ? true : false,
                        data_product: (productKnowledge) ? productKnowledge : null,
                        created_unique: (valueUniq) ? true : false,
                        status_unique: status,
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

    updateStock = (req, res) => {
        InvcdDet.update({
            invcd_qty: 0
        }, {
            where: {
                invcd_alias_qrbarcode: req.body.uniq
            },
            logging: async (sqlCommand, {bind}) => {
                let realSql = sqlCommand.replace("Executing (default): ", "");
                await insertQuery(realSql, bind);
            }
        })
        .then(result => {
            res.status(200)
                .json({
                    status:'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: err.message
                })
        })
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

    checkExistanceUnique = async (body) => {
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
                    [Op.eq]: body.uniq
                }),
                Sequelize.or([
                    Sequelize.where(Sequelize.col(`"detail_inventory"."pt_code"`), {
                        [Op.eq]: body.qr
                    }),
                    Sequelize.where(Sequelize.col(`"detail_inventory"."pt_id"`), {
                        [Op.eq]: body.pt_id
                    })
                ])
            ],
            logging: false
        })

        return (result) ? true : false
    }

    updateIncomeUnique = async (body, qty) => {
        let result = await InvcdDet.update({
            invcd_qty: qty,
            invcd_upd_by: 'system-getdesc',
            invcd_upd_date: moment().format('YYYY-MM-DD HH:mm:ss')
        }, {
            where: {
                invcd_alias_qrbarcode: body.uniq,
                invcd_pt_id: body.pt_id
            },
            logging: async (sqlCommand, {bind}) => {
                const realSql = sqlCommand.replace("Executing (default): ", "");

                await insertQuery(realSql, bind);
            }
        })

        return result;
    }

    createNewUnique = async (requirement, body) => {
        let result = null;

        if (requirement) {
            result = await InvcdDet.create({
                invcd_oid: uuidv4(),
                invcd_dom_id: 1,
                invcd_en_id: requirement.dataValues.entity_id,
                invcd_pt_id: requirement.dataValues.product_id,
                invcd_qty: 1,
                invcd_loc_id: requirement.dataValues.location_id,
                invcd_um: 9964,
                invcd_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                invcd_add_by: 'system-getdesc',
                invcd_is_verified: (requirement.dataValues.product_code.substring(0, 6) == 'AMS240') ? 'Y' : 'N',
                invcd_alias_qrbarcode: body.uniq
            }, {
                logging: async (query, {bind}) => {
                    const realSql = query.replace("Executing (default): ", "");

                    await insertQuery(realSql, bind);
                }
            })
        }

        return result;
    }
}

module.exports = new StockController();