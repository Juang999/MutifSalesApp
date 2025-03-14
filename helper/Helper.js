const {TConfSetting, TSqlOut} = require('../models');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');
const {config} = require('../config/environment');


class Helper {
    page = (page, limit) => {
        let pagePage = (page) ? page : 1
        let pageLimit = limit
    
        return {
            page: pagePage,
            limit: pageLimit,
            offset: (pagePage * pageLimit) - pageLimit
        }
    }

    serverSetting = async (columns) => {
        let columnNeed = (columns.length != null) ? columns : ['create_jurnal', 'server_code', 'xmpp_name', 'xmpp_ip', 'http_foto', 'version_code', 'version_id', 'serv_code'];

        let result = await TConfSetting.findOne({
            attributes: columnNeed,
            logging: false
        });

        return result;
    }

    errorResponse = (message) => {
        return (config.parsed.NODE_ENV == 'production') ? 'Server Error' : message;
    }

    insertQuery = async (sql, bind, sequence) => {
            const resultQuery = this.bindData(sql, bind);
    
            await this.createData(resultQuery, sequence)
    }

    insertBulkQuery = async (sql, sequential) => {
        let sequence = sequential || 1;
        await this.createData(sql, sequence);
    }

    bindData = (query, values) => {
        return query.replace(/\$(\d+)/g, (match, number) => {
            return (values[number - 1] == null) ? null : "'"+values[number - 1]+"'";
        });
    }

    createData = async (sql, sequence) => {
        try {
            await TSqlOut.create({
                sql_uid: uuidv4(),
                seq: sequence,
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

module.exports = new Helper();