const {TConfSetting} = require('../models');

class SettingServer {
    get = async (columns) => {
        let columnNeed = (columns.length != null) ? columns : ['create_jurnal', 'server_code', 'xmpp_name', 'xmpp_ip', 'http_foto', 'version_code', 'version_id', 'serv_code'];

        let result = await TConfSetting.findOne({
            attributes: columnNeed,
            logging: false
        });

        return result;
    }
}

module.exports = new SettingServer();