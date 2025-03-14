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

    testConnection = async () => {
        try {
            await sequelize.authenticate();

            return 'connected'
        } catch (error) {
            return error.messsage
        }
    }
}

module.exports = new GetDescService();