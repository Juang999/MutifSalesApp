const moment = require('moment');
const {Op} = require('sequelize');
const {
    Sequelize,
    CodeMstr, PtMstr,
    PtnrMstr, PtnraAddr,
    PtnracCntc,SoMstr, SodDet,
} = require('../../models');
const {insertQuery, insertBulkQuery} = require('../../helper/InputQueryIntoSqlOut');

class SalesOrderService {
    createHeaderOrder = async (data, transaction) => {
        await SoMstr.bulkCreate(data, {
            transaction,
            logging: (sqlCommand) => {
                let realSql = sqlCommand.split(': ')[1];

                insertBulkQuery(realSql, 1)
            }
        })
    }

    createDetailOrder = async (data, transaction) => {
        await SodDet.bulkCreate(data, {
            transaction,
            logging: (sqlCommand) => {
                let realSql = sqlCommand.split(': ')[1];

                insertBulkQuery(realSql, 2)
            }
        })
    }

    generateTotalOrder = async (transaction) => {
        let startDate = moment().startOf('months').format('YYYY-MM-DD');
        let endDate = moment().endOf('months').format('YYYY-MM-DD');

        let result = await SoMstr.count({
            where: [
                Sequelize.where(Sequelize.literal(`DATE(so_add_date)`), {
                    [Op.between]: [startDate, endDate]
                })
            ],
            transaction
        });

        return result;
    }
}

module.exports = new SalesOrderService();