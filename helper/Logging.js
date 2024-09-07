const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

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

    info = (feature, message) => {
        this.Logger.info({feature, message});
    }

    error = (feature, message) => {
        this.Logger.error({feature, message});
    }
}

module.exports = new Logging();