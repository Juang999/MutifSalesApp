const GetDescIn = require('../../models/modelGetDesc/getdescin');
const {Op} = require('sequelize');
const {sequelize, Sequelize} = require('../../models/modelGetDesc/getdescindex');

class GetDescService {
    getAllData = async (search) => {
        let result = await GetDescIn.findAll({
            attributes: [
                ['name', 'product_name'],
                ['qr', 'product_code'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', qr, '.jpg')`), 'thumbnail'],
                [Sequelize.literal(`'MUTIF'`), 'entity'],
                [Sequelize.literal(`'-'`), 'category'],
                [Sequelize.literal(`COUNT(*)`), 'qty'],
                
            ],
            where: {
                status: 1,
                loc: {
                    [Op.in]: ['kutaluhur', 'pusat']
                },
                name: {
                    [Op.like]: `%${search}%`
                }
            },
            group: ['qr', 'name'],
            having: Sequelize.where(Sequelize.literal(`COUNT(*)`), '>', 0),
            // logging: false
        })

        return result;
    }

    getDetailData = async (partNumber) => {
        let result = await GetDescIn.findAll({
            attributes: [
                'loc',
                'qr',
                'name',
                [Sequelize.literal(`COUNT(*)`), 'counts'],
            ],
            where: {
                status: 1,
                qr: partNumber,
                loc: {
                    [Op.in]: ['kutaluhur', 'pusat']
                },
            },
            group: ['loc', 'qr', 'name'],
            having: Sequelize.where(Sequelize.literal(`COUNT(*)`), '>', 0),
            order: [
                ['loc', 'ASC']
            ],
            logging: false
        })

        return result;
    }

    getDetail = async (partNumber) => {
        let result = await GetDescIn.findOne({
            attributes: [
                ['name', 'product_name'],
                ['qr', 'product_code'],
                [Sequelize.literal(`CONCAT('https://cdn.mutif.biz.id/thumbnail/', qr, '.jpg')`), 'photo'],
                [Sequelize.literal('0'), 'product_weight'],
                [Sequelize.literal('0'), 'product_height'],
                [Sequelize.literal('0'), 'product_width'],
                [Sequelize.literal('0'), 'product_length'],
            ],
            where: {
                qr: partNumber,
            },
            logging: false
        })

        return result;
    }
}

module.exports = new GetDescService();