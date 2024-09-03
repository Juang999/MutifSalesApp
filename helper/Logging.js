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

    info = (message) => {
        this.Logger.info(message);
    }

    error = (message) => {
        this.Logger.error(message);
    }
}

module.exports = new Logging();