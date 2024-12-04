const {
    PlansMstr, PlansptdDet,
    Sequelize, TConfSetting,
} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');

class CreateSalesPlansHelper {
    periodeCode = moment().format('YYYYMM')

    inputSalesPlans = async (request) => {
        let dataHeader = await this.inputHeaderSalesPlans(request);
        await this.inputProductSalesPlans(dataHeader, request);
    }

    inputHeaderSalesPlans = async (request) => {
        var result;

        result = await this.checkHeaderSalesPlans(request.entity_id);
        if (!result) {
            result = await this.createSalesPlans(request.entity_id);
        }

        return result;
    }

    inputProductSalesPlans = async (headerSalesPlans, request) => {
        let {dataValues: dataHeader} = headerSalesPlans;

        let result = await this.checkProductSalesPlan(request.product_id, request.entity_id);
        if (!result) {
            await this.createProductSalesPlan(dataHeader.plans_oid, request);
        } else {
            await this.updateProductSalesPlan(dataHeader.plans_oid, result.dataValues.plansptd_amount, request);
        }
    }

    checkHeaderSalesPlans = async (entityId) => {
        const headerSalesPlan = await PlansMstr.findOne({
            attributes: [
                'plans_oid'
            ],
            where: {
                plans_periode: this.periodeCode,
                plans_en_id: entityId
            },
            logging: false
        });

        return headerSalesPlan;
    }

    checkProductSalesPlan = async (productId, entityId) => {
        const productSalesPlan = await PlansptdDet.findOne({
            attributes: [
                'plansptd_oid',
                [Sequelize.literal(`CAST(plansptd_amount AS INTEGER)`), 'plansptd_amount']
            ],
            where: {
                plansptd_pt_id: productId,
                plansptd_plans_oid: {
                    [Op.eq]: Sequelize.literal(`(SELECT plans_oid FROM public.plans_mstr WHERE plans_en_id = ${entityId} AND plans_periode = '${this.periodeCode}')`)
                }
            },
            logging: false
        });

        return productSalesPlan;
    }

    createSalesPlans = async (entityId) => {
        let salesPlansCode = await this.generateCodeSalesPlans(entityId);
        
        let dataHeader = await PlansMstr.create({
            plans_oid: uuidv4(),
            plans_code: salesPlansCode,
            plans_date: moment().format('YYYY-MM-DD'),
            plans_periode: this.periodeCode,
            plans_sales_id: 30003001,
            plans_add_by: 'admin',
            plans_add_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            plans_amount_total: 0,
            plans_dom_id: 1,
            plans_en_id: entityId
        }, {
            logging: false
        });

        return dataHeader;
    }

    generateCodeSalesPlans = async (entityId) => {
        /**
         * data requirements
         * sqCode, montlyId, baseSequence, entityCode, yearPlusMonth, sqSequence, sequence
         * 
         * Data Arrangement
         * sqCode + entityCode + yearPlusMonth + serverCode + montlyId + sequence
        */

        let salesPlansCode = 'SP';
        let monthlyId = '000';
        let baseSequence = '0000';
        let entityCode = `${entityId}0`;
        let yearPlusMonth = moment().format('YYMM');
        let sqSequence = await this.totalSalesPlans();
        let {server_code: serverCode} = await this.getServerCode();
        let sequence = baseSequence.slice(0, -sqSequence.toString().length) + sqSequence;

        return salesPlansCode + entityCode + yearPlusMonth + serverCode + monthlyId + sequence;
    }

    getServerCode = async () => {
        let {dataValues} = await TConfSetting.findOne();

        return dataValues;
    }

    totalSalesPlans = async () => {
        const startTimestamp = moment().format('YYYY-MM-DD 00:00:00');
        const endTimestamp = moment().format('YYYY-MM-DD 23:59:59');

        let totalSalesPlans = await PlansMstr.count({
            where: {
                plans_add_date: {
                    [Op.and]: [startTimestamp, endTimestamp]
                }
            }
        })

        return totalSalesPlans + 1;
    }

    createProductSalesPlan = async (plansOid, request) => {
        await PlansptdDet.create({
            plansptd_oid: uuidv4(),
            plansptd_plans_oid: plansOid,
            plansptd_pt_id: request.product_id,
            plansptd_amount: parseInt(request.quantity)
        }, {
            logging: false
        })
    }

    updateProductSalesPlan = async (plansOid, oldAmount, request) => {
        await PlansptdDet.update({
            plansptd_amount: parseInt(request.quantity) + oldAmount
        }, {
            where: {
                plansptd_plans_oid: plansOid,
                plansptd_pt_id: request.product_id
            },
            logging: false
        })
    }
}

module.exports = new CreateSalesPlansHelper();