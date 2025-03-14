const { DataTypes, Model } = require('sequelize');
const {sequelize} = require('./getdescindex.js');

class GetDescIn extends Model {}

GetDescIn.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        uniq: DataTypes.STRING,
        qr: DataTypes.STRING,
        name: DataTypes.STRING,
        status: DataTypes.STRING,
        date: DataTypes.DATEONLY,
        loc: DataTypes.STRING,
        transaction_code: DataTypes.STRING,
        status_transaction: DataTypes.STRING,
        date_sold: DataTypes.DATE,
        chart_sales_oid: DataTypes.STRING,
        sq_code: DataTypes.STRING,
    },
    {
        sequelize,
        timestamps: false,
        tableName: 'getdesc_in',
        modelName: 'GetDescIn',
    }
)

module.exports = GetDescIn;