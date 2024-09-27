const GetDescIn = require('../models/getdescin');
const {Sequelize} = require('sequelize');

class StockController {
    getStock = async (productCode) => {
        try {
            let result = await GetDescIn.findOne({
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
        } catch (error) {
            return error.message
        }
    }
}

module.exports = new StockController();