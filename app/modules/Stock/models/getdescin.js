const {DataTypes, Model} = require('sequelize');
const {sequelize} = require('./index');

class GetDescIn extends Model {

}

GetDescIn.init({
    uniq: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    qr: DataTypes.STRING,
    name: DataTypes.STRING,
    status: DataTypes.STRING,
    date: DataTypes.DATE,
    loc: DataTypes.STRING,
    transaction_code: DataTypes.STRING,
    status_transaction: DataTypes.STRING,
    date_sold: DataTypes.DATE,
    chart_sales_oid: DataTypes.STRING,
    sq_code: DataTypes.STRING
}, {
    sequelize,
    timestamps: false,
    modelName: 'GetDescIn',
    tableName: 'getdesc_in',
    defaultScope: {
        where: {
            status: '1',
        }
    },
    scopes: {
        nullStatusTransaction: {
            where: {
                status_transaction: null
            }
        },
        nullDateSold: {
            where: {
                date_sold: null
            }
        },
        nullChartSalesOid: {
            where: {
                chart_sales_oid: null
            }
        },
        nullSqCode: {
            where: {
                sq_code: null
            }
        }
    }
})

module.exports = sequelize.models.GetDescIn;