const GetDescIn = require('../../models/modelGetDesc/getdescin');
const {Op} = require('sequelize');
const {sequelize, Sequelize} = require('../../models/modelGetDesc/getdescindex');

class GetDescService {
    getAllData = async () => {
        let result = await GetDescIn.findAll({
            attributes: [
                'qr',
                'name',
                [Sequelize.literal(`COUNT(*)`), 'counts'],
            ],
            where: {
                status: 1,
                loc: {
                    [Op.in]: ['kutaluhur', 'pusat']
                },
            },
            group: ['qr', 'name'],
            having: Sequelize.where(Sequelize.literal(`COUNT(*)`), '>', 0),
            logging: false
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
            logging: false
        })

        return result;
    }
}

module.exports = new GetDescService();