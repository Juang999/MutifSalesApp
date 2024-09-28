const moment = require('moment');
const {Op} = require('sequelize');
const {ChartSales, Sequelize} = require('../models');
const {bulkReleaseQuantity} = require('../app/modules/Stock/controllers/StockProductController');

class SalesExecution {
    run = async () => {
        let currentTimestamp = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
        let csOid = await this.getCartSalesOid(currentTimestamp);
        if (csOid.length != 0) {
            await bulkReleaseQuantity(csOid);
            await this.updateDataCartSales(csOid);

            console.info('data updated!');
        } else {
            console.info('data checked!');
        }
    }

    getCartSalesOid = async (timestamp) => {
        let result = await ChartSales.findAll({
            attributes: [
                'cs_oid',
                [Sequelize.literal(`TO_CHAR(cs_updated_at, 'HH24')`), 'jam']
            ],
            where: {
                cs_updated_at: {
                    [Op.lt]: timestamp
                }
            }
        })

        return result.map(({dataValues}) => dataValues.cs_oid)
    }

    updateDataCartSales = async (bulkCartSalesOid) => {
        await ChartSales.update({
            cs_qty: 0,
            cs_updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
        }, {
            where: {
                cs_oid: {
                    [Op.in]: bulkCartSalesOid
                }
            }
        })
    }
}

let salesExecution = new SalesExecution();
salesExecution.run();