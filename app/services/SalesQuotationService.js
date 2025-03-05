const moment = require('moment');
const {Op} = require('sequelize');
const {SqMstr, SqdDet, Sequelize} = require('../../models');
const {insertQuery, insertBulkQuery} = require('../../helper/InputQueryIntoSqlOut');

class SalesQuotationService {
    countDataSalesQuotation = async () => {
            let startOfMonth = moment().startOf('months').format('YYYY-MM-DD');
            let endOfMonth = moment().endOf('months').format('YYYY-MM-DD');
    
            let result = await SqMstr.count({
                where: {
                    [Op.and]: [
                        Sequelize.where(Sequelize.literal('DATE(sq_add_date)'), {
                            [Op.between]: [startOfMonth, endOfMonth]
                        })
                    ],
                },
                logging: false,
            });
    
            return result;
    }

    bulkInsertHeaderSalesQuotation = async (dataHeaderSalesQuotation, transaction) => {
        await SqMstr.bulkCreate(dataHeaderSalesQuotation, {
            transaction,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql, 1)
            },
        })
    }

    bulkInsertDetailSalesQuotation = async (dataDetailSalesQuotation, transaction) => {
        await SqdDet.bulkCreate(dataDetailSalesQuotation, {
            transaction,
            logging: async (sql) => {
                const regexPattern = /Executing \([a-f0-9-]+\):/;
                const realSql = sql.replace(regexPattern, "");

                await insertBulkQuery(realSql, 2)
            },
        })
    }
}

module.exports = new SalesQuotationService();