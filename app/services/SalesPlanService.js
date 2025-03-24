const {
    PlansMstr, PlansptdDet,
    Sequelize, TConfSetting,
} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');
const {v4: uuidv4} = require('uuid');

class SalesPlanService {
    /**
     * HSP -> Header Sales Plan
    */

    periodeCode = moment().format('YYYYMM')

    findHSP = async (entityId) => {
        const result = await PlansMstr.findOne({
            attributes: [
                'plans_oid'
            ],
            where: {
                plans_periode: this.periodeCode,
                plans_en_id: entityId
            },
            logging: false
        });

        return result;
    }

    inputHSP = async (entityId) => {
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
}