const {config} = require('../config/environment');
const {get} = require('express-http-context');
const {verify} = require('jsonwebtoken');

class Auth {
    user = () => {
        let token = get('token');

        if (token != null) {
            let {userid, usernama, password, groupid, user_ptnr_id, ptnrg_id} = verify(get('token'), config.parsed.ACCESS_TOKEN_SECRET);
            return {userid, usernama, password, groupid, user_ptnr_id, ptnrg_id};
        } else {
            return {
                userid: null, 
                usernama: null,
                password: null, 
                groupid: null, 
                user_ptnr_id: null, 
                ptnrg_id: null
            }
        }

    }
}

module.exports = new Auth();