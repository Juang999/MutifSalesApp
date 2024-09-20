const {TSqlOut} = require('../models');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');

class InputQueryIntoSqlOut {
    insertQuery = async (sql, bind) => {
        const resultQuery = this.bindData(sql, bind);

        await this.createData(resultQuery)
    }

    insertBulkQuery = async (sql) => {
        await this.createData(sql, {
            logging: false
        });
    }

    bindData = (query, values) => {
        return query.replace(/\$(\d+)/g, (match, number) => {
            return "'"+values[number - 1]+"'";
        });
    }

    createData = async (sql) => {
        console.info(sql)
        try {
            await TSqlOut.create({
                sql_uid: uuidv4(),
                sql_command: sql,
                waktu: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                logging: false
            })
        } catch (error) {
            console.info(error.message)

            return error.message
        }
    }
}

module.exports = new InputQueryIntoSqlOut();