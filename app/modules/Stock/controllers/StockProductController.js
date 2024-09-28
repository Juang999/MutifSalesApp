const GetDescIn = require('../models/getdescin');
const {Sequelize, Op} = require('sequelize');
const {sequelize} = require('../models/index');

class StockController {
    getStock = async (productCode) => {
        let result = await GetDescIn.scope(['nullStatusTransaction', 'nullDateSold', 'nullChartSalesOid', 'nullSqCode']).findOne({
            attributes: [
                'qr',
                'name',
                [Sequelize.literal('COUNT(DISTINCT(uniq))'), 'quantity']
            ],
            group: [
                'qr',
                'name'
            ],
            where: {
                qr: productCode
            },
            logging: false
        })

        return {
            qr: (result) ? result.dataValues.qr : null,
            name: (result) ? result.dataValues.name: null,
            quantity: (result) ? result.dataValues.quantity : 0
        };
    }

    getStockWithTransaction = async (productCode) => {
        let result = await sequelize.transaction(async t => {
            let stock = await GetDescIn.scope(['nullStatusTransaction', 'nullDateSold', 'nullChartSalesOid', 'nullSqCode']).findOne({
                attributes: [
                    'qr',
                    'name',
                    [Sequelize.literal('COUNT(DISTINCT(uniq))'), 'quantity']
                ],
                group: [
                    'qr',
                    'name'
                ],
                where: {
                    qr: productCode
                },
                transaction: t,
                logging: false
            })

            return stock;
        })

        return {
            qr: (result) ? result.dataValues.qr : null,
            name: (result) ? result.dataValues.name: null,
            quantity: (result) ? result.dataValues.quantity : 0
        };
    }

    updateStock = async (productCode, cartSalesOid, quantityProduct) => {
        let uniqNumber = await this.getUniqueNumberProduct(productCode, quantityProduct);

        let result = await sequelize.transaction(async t => {
                let data = await GetDescIn.scope(['nullStatusTransaction', 'nullDateSold', 'nullChartSalesOid', 'nullSqCode']).update({
                        chart_sales_oid: cartSalesOid
                    }, {
                        where: {
                            uniq: uniqNumber,
                        },
                        transaction: t,
                        logging: false
                    })

                return data;
            })

        return result;
    }

    getUniqueNumberProduct = async (productCode, limitProduct) => {
        let result = await GetDescIn.scope(['nullStatusTransaction', 'nullDateSold', 'nullChartSalesOid', 'nullSqCode']).findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('uniq')), 'uniq']
            ],
            where: {
                qr: productCode
            },
            limit: parseInt(limitProduct),
            logging: false
    })

        return result.map(({dataValues}) => dataValues.uniq);
    }

    deleteOidFromStockProduct = async (cartSalesOid, limit) => {
        let serialNumber = await this.getSerialNumberWithCsOidAndLimit(cartSalesOid, limit);

        let result = await GetDescIn.update({
            chart_sales_oid: null
        }, {
            where: {
                uniq: {
                    [Op.in]: serialNumber
                }
            },
            logging: false
        })

        return result;
    }

    getSerialNumberWithCsOidAndLimit = async (csOid, limit) => {
        let result = await GetDescIn.scope(['nullStatusTransaction', 'nullDateSold', 'nullSqCode']).findAll({
            atributes: [
                'uniq'
            ],
            where: {
                chart_sales_oid: csOid
            },
            limit
        })

        return result.map(({dataValues}) => {
            return dataValues.uniq;
        })
    }
}

module.exports = new StockController();