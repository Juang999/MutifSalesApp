const GetDescIn = require('../../models/modelGetDesc/getdescin');
const GetDescMasterData = require('../../models/modelGetDesc/getdescmasterdata');
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
        let [result] = await sequelize.query(`
                SELECT
                    product.pt_id AS product_id,
                    name AS product_name,
                    qr AS product_code,
                    CONCAT('https://cdn.mutif.biz.id/thumbnail/', qr, '.jpg') AS photo,
                    '0' AS product_weight,
                    '0' AS product_height,
                    '0' AS product_width,
                    '0' AS product_length
                FROM getdesc_in
                LEFT OUTER JOIN getdesc_master_data AS product ON getdesc_in.qr = product.pt_code
                WHERE qr = :partnumber
                LIMIT 1
            `, {
                replacements: {
                    partnumber: partNumber
                },
                logging: false
            })

        return result;
    }

    getAllDataV2 = async (search) => {
        try {
            let [result] = await sequelize.query(`
                SELECT 
                    data_product.pt_id AS 'product_id', 
                    GetDescIn.name AS 'product_name', 
                    GetDescIn.qr AS 'product_code', 
                    CONCAT('https://cdn.mutif.biz.id/thumbnail/', qr, '.jpg') AS 'thumbnail', 
                    'MUTIF' AS 'entity', 
                    '-' AS 'category', 
                    COUNT(*) AS 'qty' 
                FROM getdesc_in AS GetDescIn 
                LEFT OUTER JOIN getdesc_master_data AS data_product ON GetDescIn.qr = data_product.pt_code 
                WHERE GetDescIn.status = 1 
                AND GetDescIn.loc IN ('kutaluhur', 'pusat') 
                AND GetDescIn.name LIKE :search 
                GROUP BY 
                    qr, 
                    name, 
                    data_product.pt_id 
                HAVING COUNT(*) > 0
                `, {
                    replacements: {
                        search: `%${search}%`
                    },
                    logging: false
                })
    
            return result;
        } catch (error) {
            return error.message;
        }
    }
}

module.exports = new GetDescService();