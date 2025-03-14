const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const {messageSend} = require('./TelegramBot');

class Logging {
    Logger = winston.createLogger({
        level: "silly",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json()
        ),
        transports: [
            new DailyRotateFile({
                filename: 'log-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '30d',
                dirname: 'log'
            })
        ]
    })

    LoggerError = winston.createLogger({
        level: "silly",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.json()
        ),
        transports: [
            new DailyRotateFile({
                filename: 'log-error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '30d',
                dirname: 'error-log'
            })
        ]
    })

    info = (feature, message, data) => {
        this.Logger.info({feature, message, data});
    }

    error = (feature, message) => {
        this.LoggerError.error({feature, message, data: 0});
    }

    errorV2 = async (feature, message) => {
        await messageSend(feature, 'error', message);

        this.LoggerError.error({feature, message, data: 0});
    }
}

module.exports = new Logging();