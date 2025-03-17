const { DataTypes, Model } = require('sequelize');
const {sequelize} = require('./getdescindex.js');

class GetDescMasterData extends Model {
    static associate(models) {
        // define association here
    }
}

GetDescMasterData.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        no: DataTypes.INTEGER,
        pt_id: DataTypes.INTEGER,
        pt_en_id: DataTypes.STRING,
        pt_code: DataTypes.STRING,
        pt_desc: DataTypes.STRING,
        pt_dt: DataTypes.DATE,
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'getdesc_master_data',
        modelName: 'GetDescMasterData',
    }
)

module.exports = GetDescMasterData;