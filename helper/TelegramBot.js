const moment = require('moment');
const {config} = require('../config/environment');
const PackageTelegramBot = require('node-telegram-bot-api');

class TelegramBot {
    messageSend = async (feature, status, message) => {
        const waktu = moment().format('YYYY-MM-DD HH:mm:ss');
        const {NODE_ENV: stage, APP_NAME: appName} = config.parsed;

        let dataMessage = `--=[ ${appName} ]=--\nStage: ${stage}\nTanggal & Waktu: ${waktu}\n\nFeature: ${feature}\nStatus: ${status}\nmessage: ${message}`

        await this.botSetting(dataMessage);
    }

    botSetting = async (message) => {
        let {parsed: dataEnv} = config;

        let bot = new PackageTelegramBot(dataEnv.TELEGRAM_BOT_TOKEN);
        let chatId = dataEnv.DEVELOPER_TELEGRAM_ID;

        try {
            await bot.stopPolling();
            await bot.sendMessage(chatId, message)
        } catch (error) {
            await bot.stopPolling();
        }
    }
}
module.exports = new TelegramBot();